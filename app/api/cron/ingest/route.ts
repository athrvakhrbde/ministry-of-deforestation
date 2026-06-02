import { NextRequest, NextResponse } from "next/server";
import { runNewsIngest } from "@/lib/ingest/engine";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function authorize(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV === "development";

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const header = request.headers.get("x-cron-secret");
  if (header === secret) return true;

  // Vercel Cron sends this header
  if (request.headers.get("x-vercel-cron") === "1" && secret) return true;

  return false;
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runNewsIngest();
  return NextResponse.json({
    ok: result.errors.length === 0 || result.incidentsCreated > 0,
    ...result,
    finished_at: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
