"use client";

import { useCallback, useEffect, useState } from "react";
import type { IngestStatus } from "@/lib/ingest/types";

export function useIngestStatus(pollMs = 60000, enabled = true) {
  const [status, setStatus] = useState<IngestStatus | null>(null);

  const fetchStatus = useCallback(
    async (sync = false) => {
      if (!enabled) return;
      try {
        const url = sync ? "/api/ingest/status?sync=1" : "/api/ingest/status";
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) setStatus(await res.json());
      } catch {
        /* ignore */
      }
    },
    [enabled]
  );

  useEffect(() => {
    if (!enabled) return;
    fetchStatus(false);
    const interval = setInterval(() => fetchStatus(false), pollMs);
    return () => clearInterval(interval);
  }, [fetchStatus, pollMs, enabled]);

  useEffect(() => {
    if (!enabled) return;
    const t = window.setTimeout(() => fetchStatus(true), 4000);
    return () => clearTimeout(t);
  }, [enabled, fetchStatus]);

  return { status, refetch: fetchStatus };
}
