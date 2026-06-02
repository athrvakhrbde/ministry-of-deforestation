"use client";

import { formatDistanceToNow, format } from "date-fns";
import type { IngestStatus } from "@/lib/ingest/types";

export default function LiveStatusBar({ status }: { status: IngestStatus | null }) {
  if (!status) return null;

  const isRunning = status.currently_running;
  const lastRun = status.last_run_at
    ? formatDistanceToNow(new Date(status.last_run_at), { addSuffix: true })
    : "never";

  return (
    <div className="h-7 sm:h-8 flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-4 gap-y-0.5 px-3 sm:px-4 bg-black border-b border-paper/10 shrink-0 font-data text-2xs sm:text-[9px] z-20">
      <span className="flex items-center gap-1.5">
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            isRunning ? "bg-amber-warn animate-pulse" : "bg-green-forest"
          }`}
        />
        <span className={isRunning ? "text-amber-warn" : "text-green-forest"}>
          {isRunning ? "SYNC IN PROGRESS" : "LIVE FEED ACTIVE"}
        </span>
      </span>
      <span className="text-muted hidden xs:inline">·</span>
      <span className="text-muted truncate max-w-[45vw] sm:max-w-none">
        LAST: {lastRun.toUpperCase()}
        {status.incidents_created_last > 0 &&
          ` (+${status.incidents_created_last})`}
      </span>
      <span className="text-muted hidden sm:inline">·</span>
      <span className="text-muted hidden sm:inline whitespace-nowrap">
        NEXT {format(new Date(status.next_run_at), "dd MMM HH:mm")}
      </span>
      <span className="text-muted hidden xl:inline">·</span>
      <span className="text-muted hidden xl:inline">{status.schedule}</span>
    </div>
  );
}
