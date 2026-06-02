import { NextResponse } from "next/server";
import { getAllIncidents } from "@/lib/get-incident";
import { aggregateStats } from "@/lib/stats";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const incidents = await getAllIncidents();
    const stats = aggregateStats(incidents);
    return NextResponse.json({
      ...stats,
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
