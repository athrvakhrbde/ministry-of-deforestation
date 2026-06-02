import type { ReasonCategory, IncidentStatus, ClearanceStatus } from "@/lib/types";

export interface RawArticle {
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  sourceName: string;
}

export interface ParsedIncidentDraft {
  source_hash: string;
  location_name: string;
  state: string;
  district: string | null;
  lat: number;
  lng: number;
  tree_count: number | null;
  species: string[] | null;
  reason_category: ReasonCategory;
  reason_detail: string;
  project_name: string | null;
  authority: string | null;
  ministry: string | null;
  clearance_status: ClearanceStatus;
  ngt_case: string | null;
  source_url: string;
  source_type: "news" | "scraped";
  verified: boolean;
  status: IncidentStatus;
  created_at: string;
}

export interface IngestResult {
  articlesFetched: number;
  incidentsCreated: number;
  incidentsSkipped: number;
  errors: string[];
}

export interface IngestStatus {
  is_live: boolean;
  last_run_at: string | null;
  last_run_status: string | null;
  next_run_at: string;
  articles_fetched_last: number;
  incidents_created_last: number;
  total_news_incidents: number;
  schedule: string;
  currently_running: boolean;
}
