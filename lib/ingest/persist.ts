import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { createServiceSupabase } from "@/lib/supabase/server";
import type { Incident } from "@/lib/types";
import type { ParsedIncidentDraft, IngestResult } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const LIVE_FILE = path.join(DATA_DIR, "live-incidents.json");
const STATUS_FILE = path.join(DATA_DIR, "ingest-status.json");
const HASHES_FILE = path.join(DATA_DIR, "ingest-hashes.json");

export interface StoredIngestStatus {
  last_run_at: string | null;
  last_run_status: "completed" | "failed" | "running" | null;
  articles_fetched_last: number;
  incidents_created_last: number;
  incidents_skipped_last: number;
  currently_running: boolean;
  errors?: string[];
}

function isSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function readLiveIncidents(): Promise<Incident[]> {
  try {
    const raw = await readFile(LIVE_FILE, "utf-8");
    return JSON.parse(raw) as Incident[];
  } catch {
    return [];
  }
}

export async function readKnownHashes(): Promise<Set<string>> {
  try {
    const raw = await readFile(HASHES_FILE, "utf-8");
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

async function writeKnownHashes(hashes: Set<string>) {
  await ensureDataDir();
  await writeFile(HASHES_FILE, JSON.stringify(Array.from(hashes)), "utf-8");
}

export async function getIngestStatus(): Promise<StoredIngestStatus> {
  try {
    const raw = await readFile(STATUS_FILE, "utf-8");
    return JSON.parse(raw) as StoredIngestStatus;
  } catch {
    return {
      last_run_at: null,
      last_run_status: null,
      articles_fetched_last: 0,
      incidents_created_last: 0,
      incidents_skipped_last: 0,
      currently_running: false,
    };
  }
}

export async function setIngestStatus(status: StoredIngestStatus) {
  await ensureDataDir();
  await writeFile(STATUS_FILE, JSON.stringify(status, null, 2), "utf-8");
}

function draftToIncident(draft: ParsedIncidentDraft): Incident {
  return {
    id: `news-${draft.source_hash.slice(0, 12)}`,
    created_at: draft.created_at,
    lat: draft.lat,
    lng: draft.lng,
    location_name: draft.location_name,
    state: draft.state,
    district: draft.district,
    tree_count: draft.tree_count,
    species: draft.species,
    reason_category: draft.reason_category,
    reason_detail: draft.reason_detail,
    project_name: draft.project_name,
    authority: draft.authority,
    ministry: draft.ministry,
    clearance_status: draft.clearance_status,
    ngt_case: draft.ngt_case,
    source_url: draft.source_url,
    source_type: draft.source_type,
    contributor_id: null,
    verified: draft.verified,
    media_urls: null,
    status: draft.status,
  };
}

async function persistToFile(
  drafts: ParsedIncidentDraft[],
  knownHashes: Set<string>
): Promise<{ created: number; skipped: number }> {
  const existing = await readLiveIncidents();
  const existingHashes = new Set(existing.map((i) => i.id.replace("news-", "")));
  let created = 0;
  let skipped = 0;
  const newIncidents: Incident[] = [];

  for (const draft of drafts) {
    if (knownHashes.has(draft.source_hash) || existingHashes.has(draft.source_hash.slice(0, 12))) {
      skipped++;
      continue;
    }
    knownHashes.add(draft.source_hash);
    newIncidents.push(draftToIncident(draft));
    created++;
  }

  if (newIncidents.length > 0) {
    await ensureDataDir();
    const merged = [...newIncidents, ...existing].slice(0, 500);
    await writeFile(LIVE_FILE, JSON.stringify(merged, null, 2), "utf-8");
    await writeKnownHashes(knownHashes);
  }

  return { created, skipped };
}

async function persistToSupabase(
  drafts: ParsedIncidentDraft[],
  knownHashes: Set<string>
): Promise<{ created: number; skipped: number }> {
  const supabase = createServiceSupabase();
  let created = 0;
  let skipped = 0;

  const { data: existingRows } = await supabase
    .from("incidents")
    .select("source_hash")
    .not("source_hash", "is", null);

  const dbHashes = new Set(
    (existingRows ?? []).map((r: { source_hash: string }) => r.source_hash)
  );

  for (const draft of drafts) {
    if (knownHashes.has(draft.source_hash) || dbHashes.has(draft.source_hash)) {
      skipped++;
      continue;
    }

    const { error } = await supabase.from("incidents").insert({
      lat: draft.lat,
      lng: draft.lng,
      location_name: draft.location_name,
      state: draft.state,
      district: draft.district,
      tree_count: draft.tree_count,
      species: draft.species,
      reason_category: draft.reason_category,
      reason_detail: draft.reason_detail,
      project_name: draft.project_name,
      authority: draft.authority,
      ministry: draft.ministry,
      clearance_status: draft.clearance_status,
      ngt_case: draft.ngt_case,
      source_url: draft.source_url,
      source_type: draft.source_type,
      verified: draft.verified,
      status: draft.status,
      source_hash: draft.source_hash,
      created_at: draft.created_at,
      contributor_id: null,
      media_urls: null,
    });

    if (error) {
      if (error.code === "23505") skipped++;
      else console.error("Insert error:", error.message);
    } else {
      created++;
      knownHashes.add(draft.source_hash);
      dbHashes.add(draft.source_hash);
    }
  }

  await writeKnownHashes(knownHashes);
  return { created, skipped };
}

export async function persistDrafts(
  drafts: ParsedIncidentDraft[]
): Promise<{ created: number; skipped: number }> {
  const knownHashes = await readKnownHashes();
  if (isSupabaseConfigured()) {
    return persistToSupabase(drafts, knownHashes);
  }
  return persistToFile(drafts, knownHashes);
}

export async function recordIngestRun(
  result: IngestResult & { status: "completed" | "failed"; startedAt: string }
) {
  if (!isSupabaseConfigured()) return;

  try {
    const supabase = createServiceSupabase();
    await supabase.from("ingest_runs").insert({
      started_at: result.startedAt,
      finished_at: new Date().toISOString(),
      status: result.status,
      articles_fetched: result.articlesFetched,
      incidents_created: result.incidentsCreated,
      incidents_skipped: result.incidentsSkipped,
      error_message: result.errors.length ? result.errors.join("; ") : null,
    });
  } catch (e) {
    console.error("Failed to record ingest run:", e);
  }
}

export async function countNewsIncidents(): Promise<number> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServiceSupabase();
      const { count } = await supabase
        .from("incidents")
        .select("*", { count: "exact", head: true })
        .eq("source_type", "news");
      return count ?? 0;
    } catch {
      return 0;
    }
  }
  const live = await readLiveIncidents();
  return live.length;
}
