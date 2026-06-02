import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { incidentCreateSchema } from "@/lib/schemas";
import { MOCK_INCIDENTS } from "@/lib/mock-data";
import { readLiveIncidents } from "@/lib/ingest/persist";
import { mergeIncidents } from "@/lib/merge-incidents";
import type { Incident } from "@/lib/types";
import { isAfter, parseISO } from "date-fns";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getAllLocalIncidents(): Promise<Incident[]> {
  const live = await readLiveIncidents();
  return mergeIncidents(MOCK_INCIDENTS, live);
}

function filterMockIncidents(
  incidents: Incident[],
  params: URLSearchParams
): Incident[] {
  let result = [...incidents];
  const id = params.get("id");
  if (id) return result.filter((i) => i.id === id);

  const state = params.get("state");
  const reasonCategory = params.get("reason_category");
  const status = params.get("status");
  const verified = params.get("verified");
  const dateFrom = params.get("date_from");
  const dateTo = params.get("date_to");
  const authority = params.get("authority");

  if (state) result = result.filter((i) => i.state === state);
  if (reasonCategory) {
    const cats = reasonCategory.split(",");
    result = result.filter((i) => cats.includes(i.reason_category));
  }
  if (status) {
    const statuses = status.split(",");
    result = result.filter((i) => statuses.includes(i.status));
  }
  if (verified === "true") result = result.filter((i) => i.verified);
  if (dateFrom)
    result = result.filter((i) => isAfter(parseISO(i.created_at), parseISO(dateFrom)));
  if (dateTo)
    result = result.filter((i) => !isAfter(parseISO(i.created_at), parseISO(dateTo)));
  if (authority)
    result = result.filter((i) =>
      i.authority?.toLowerCase().includes(authority.toLowerCase())
    );

  return result.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

function isSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!isSupabaseConfigured()) {
    const all = await getAllLocalIncidents();
    const filtered = filterMockIncidents(all, searchParams);
    if (id) {
      const incident = filtered[0];
      if (!incident)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ incident });
    }
    return NextResponse.json({ incidents: filtered, _mock: true });
  }

  try {
    const supabase = createServerSupabase();

    if (id) {
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      return NextResponse.json({ incident: data });
    }

    let query = supabase.from("incidents").select("*");

    const state = searchParams.get("state");
    const reasonCategory = searchParams.get("reason_category");
    const status = searchParams.get("status");
    const verified = searchParams.get("verified");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");
    const authority = searchParams.get("authority");

    if (state) query = query.eq("state", state);
    if (reasonCategory) {
      const cats = reasonCategory.split(",").filter(Boolean);
      if (cats.length) query = query.in("reason_category", cats);
    }
    if (status) {
      const statuses = status.split(",").filter(Boolean);
      if (statuses.length) query = query.in("status", statuses);
    }
    if (verified === "true") query = query.eq("verified", true);
    if (dateFrom) query = query.gte("created_at", dateFrom);
    if (dateTo) query = query.lte("created_at", dateTo);
    if (authority) query = query.ilike("authority", `%${authority}%`);

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ incidents: data as Incident[] });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = incidentCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const species =
      typeof input.species === "string"
        ? input.species.split(",").map((s) => s.trim()).filter(Boolean)
        : input.species;

    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("incidents")
      .insert({
        ...input,
        status: (input as { status?: string }).status ?? "ongoing",
        species: species?.length ? species : null,
        verified: false,
        contributor_id: null,
        source_url: input.source_url || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ incident: data }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
