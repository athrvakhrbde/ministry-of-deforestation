import { createServerSupabase } from "@/lib/supabase/server";
import { MOCK_INCIDENTS } from "@/lib/mock-data";
import { readLiveIncidents } from "@/lib/ingest/persist";
import { mergeIncidents } from "@/lib/merge-incidents";
import { ensureSourceUrl } from "@/lib/source-link";
import type { Incident } from "./types";

function withSourceLinks(incidents: Incident[]): Incident[] {
  return incidents.map((inc) => ({
    ...inc,
    source_url: ensureSourceUrl(
      inc.source_url,
      inc.location_name,
      inc.project_name
    ),
  }));
}

function isSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function getIncidentById(id: string): Promise<Incident | null> {
  if (!isSupabaseConfigured()) {
    const live = await readLiveIncidents();
    const all = mergeIncidents(MOCK_INCIDENTS, live);
    const found = all.find((i) => i.id === id);
    return found ? withSourceLinks([found])[0] : null;
  }

  try {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("incidents")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return withSourceLinks([data as Incident])[0];
  } catch {
    const live = await readLiveIncidents();
    const all = mergeIncidents(MOCK_INCIDENTS, live);
    const found = all.find((i) => i.id === id);
    return found ? withSourceLinks([found])[0] : null;
  }
}

export async function getAllIncidents(): Promise<Incident[]> {
  if (!isSupabaseConfigured()) {
    const live = await readLiveIncidents();
    return withSourceLinks(mergeIncidents(MOCK_INCIDENTS, live));
  }

  try {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("incidents")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) {
      const live = await readLiveIncidents();
      return withSourceLinks(mergeIncidents(MOCK_INCIDENTS, live));
    }
    return withSourceLinks(data as Incident[]);
  } catch {
    const live = await readLiveIncidents();
    return withSourceLinks(mergeIncidents(MOCK_INCIDENTS, live));
  }
}
