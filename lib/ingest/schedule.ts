import { addHours, setHours, setMinutes, setSeconds, startOfDay } from "date-fns";
import { getIngestStatus, countNewsIncidents } from "./persist";
import type { IngestStatus } from "./types";

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

/** IST = UTC+5:30 — schedule at 6:00 and 18:00 IST */
export function getNextIngestRun(): Date {
  const now = new Date();
  const istNow = addHours(now, 5.5);
  const dayStart = startOfDay(istNow);

  const slot6 = setSeconds(setMinutes(setHours(dayStart, 6), 0), 0);
  const slot18 = setSeconds(setMinutes(setHours(dayStart, 18), 0), 0);

  let nextIst: Date;
  if (istNow < slot6) nextIst = slot6;
  else if (istNow < slot18) nextIst = slot18;
  else nextIst = addHours(slot6, 24);

  return addHours(nextIst, -5.5);
}

export async function buildIngestStatus(): Promise<IngestStatus> {
  const stored = await getIngestStatus();
  const totalNews = await countNewsIncidents();
  const next = getNextIngestRun();

  return {
    is_live: true,
    last_run_at: stored.last_run_at,
    last_run_status: stored.last_run_status,
    next_run_at: next.toISOString(),
    articles_fetched_last: stored.articles_fetched_last,
    incidents_created_last: stored.incidents_created_last,
    total_news_incidents: totalNews,
    schedule: "Twice daily — 6:00 AM & 6:00 PM IST",
    currently_running: stored.currently_running,
  };
}

export function isStaleForAutoTrigger(lastRunAt: string | null): boolean {
  if (!lastRunAt) return true;
  return Date.now() - new Date(lastRunAt).getTime() > TWELVE_HOURS_MS;
}
