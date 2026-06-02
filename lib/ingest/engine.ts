import { articleToIncident } from "./classify";
import { fetchAllNewsArticles } from "./fetch-news";
import {
  persistDrafts,
  recordIngestRun,
  setIngestStatus,
  getIngestStatus,
} from "./persist";
import type { IngestResult } from "./types";

let running = false;

export async function runNewsIngest(): Promise<IngestResult> {
  if (running) {
    return {
      articlesFetched: 0,
      incidentsCreated: 0,
      incidentsSkipped: 0,
      errors: ["Ingest already in progress"],
    };
  }

  running = true;
  const startedAt = new Date().toISOString();
  const errors: string[] = [];

  await setIngestStatus({
    last_run_at: startedAt,
    last_run_status: "running",
    articles_fetched_last: 0,
    incidents_created_last: 0,
    incidents_skipped_last: 0,
    currently_running: true,
  });

  try {
    const articles = await fetchAllNewsArticles();
    const drafts = articles
      .map(articleToIncident)
      .filter((d): d is NonNullable<typeof d> => d !== null);

    const { created, skipped } = await persistDrafts(drafts);

    const result: IngestResult = {
      articlesFetched: articles.length,
      incidentsCreated: created,
      incidentsSkipped: skipped + (articles.length - drafts.length),
      errors,
    };

    await setIngestStatus({
      last_run_at: new Date().toISOString(),
      last_run_status: "completed",
      articles_fetched_last: result.articlesFetched,
      incidents_created_last: result.incidentsCreated,
      incidents_skipped_last: result.incidentsSkipped,
      currently_running: false,
    });

    await recordIngestRun({
      ...result,
      status: "completed",
      startedAt,
    });

    return result;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown ingest error";
    errors.push(message);

    await setIngestStatus({
      ...(await getIngestStatus()),
      last_run_status: "failed",
      currently_running: false,
      errors,
    });

    await recordIngestRun({
      articlesFetched: 0,
      incidentsCreated: 0,
      incidentsSkipped: 0,
      errors,
      status: "failed",
      startedAt,
    });

    return {
      articlesFetched: 0,
      incidentsCreated: 0,
      incidentsSkipped: 0,
      errors,
    };
  } finally {
    running = false;
  }
}

