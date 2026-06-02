import { NextRequest, NextResponse } from "next/server";
import { buildIngestStatus, isStaleForAutoTrigger } from "@/lib/ingest/schedule";
import { runNewsIngest } from "@/lib/ingest/engine";
import { getIngestStatus } from "@/lib/ingest/persist";

export const dynamic = "force-dynamic";

let autoTriggerLock = false;

export async function GET(request: NextRequest) {
  const status = await buildIngestStatus();
  const stored = await getIngestStatus();

  // Auto-trigger if stale (>12h) and not already running (keeps local dev alive)
  const force = request.nextUrl.searchParams.get("sync") === "1";
  const shouldSync =
    (force || isStaleForAutoTrigger(stored.last_run_at)) &&
    !stored.currently_running &&
    !autoTriggerLock;

  if (shouldSync && process.env.INGEST_AUTO_SYNC !== "false") {
    autoTriggerLock = true;
    runNewsIngest()
      .catch(console.error)
      .finally(() => {
        autoTriggerLock = false;
      });
    return NextResponse.json({
      ...status,
      currently_running: true,
      message: "News sync started in background",
    });
  }

  return NextResponse.json(status);
}
