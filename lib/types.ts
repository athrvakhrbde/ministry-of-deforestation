export type ReasonCategory =
  | "road_widening"
  | "metro_rail"
  | "power_infra"
  | "real_estate"
  | "mining"
  | "urban_beautification"
  | "disaster_clearance"
  | "illegal";

export type IncidentStatus = "ongoing" | "completed" | "halted";
export type ClearanceStatus = "cleared" | "no_clearance" | "under_review";
export type SourceType = "crowdsourced" | "news" | "rti" | "scraped";

export interface Incident {
  id: string;
  created_at: string;
  lat: number;
  lng: number;
  location_name: string;
  state: string;
  district: string | null;
  tree_count: number | null;
  species: string[] | null;
  reason_category: ReasonCategory;
  reason_detail: string | null;
  project_name: string | null;
  authority: string | null;
  ministry: string | null;
  clearance_status: ClearanceStatus | null;
  ngt_case: string | null;
  source_url: string | null;
  source_type: string | null;
  contributor_id: string | null;
  verified: boolean;
  media_urls: string[] | null;
  status: IncidentStatus;
}

export interface StatsResponse {
  total_incidents: number;
  total_trees: number;
  states_affected: number;
  ngt_cases: number;
  by_category: { reason_category: string; count: number }[];
  by_month: { month: string; count: number }[];
  top_authorities: {
    authority: string;
    count: number;
    trees: number;
    states: number;
    clearance_rate: number;
  }[];
  by_state: { state: string; count: number }[];
  recent_incidents: Incident[];
}

export interface MapFilters {
  state: string;
  reasonCategories: ReasonCategory[];
  authority: string;
  dateRange: "30d" | "1y" | "5y" | "all";
  statuses: IncidentStatus[];
  verifiedOnly: boolean;
}
