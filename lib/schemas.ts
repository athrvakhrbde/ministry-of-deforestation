import { z } from "zod";

const reasonCategoryEnum = z.enum([
  "road_widening",
  "metro_rail",
  "power_infra",
  "real_estate",
  "mining",
  "urban_beautification",
  "disaster_clearance",
  "illegal",
]);

const clearanceEnum = z.enum(["cleared", "no_clearance", "under_review"]);

export const incidentCreateSchema = z.object({
  lat: z.number().min(6).max(36),
  lng: z.number().min(68).max(98),
  location_name: z.string().min(2).max(200),
  state: z.string().min(2).max(100),
  district: z.string().max(100).optional().nullable(),
  tree_count: z.number().int().min(0).max(1000000).optional().nullable(),
  species: z.union([z.array(z.string()), z.string()]).optional().nullable(),
  reason_category: reasonCategoryEnum,
  reason_detail: z.string().max(2000).optional().nullable(),
  project_name: z.string().max(300).optional().nullable(),
  authority: z.string().max(200).optional().nullable(),
  ministry: z.string().max(200).optional().nullable(),
  clearance_status: clearanceEnum.optional().nullable(),
  ngt_case: z.string().max(100).optional().nullable(),
  source_url: z.string().url().optional().nullable().or(z.literal("")),
  source_type: z.string().max(50).optional().nullable(),
  media_urls: z.array(z.string().url()).optional().nullable(),
});

export type IncidentCreateInput = z.input<typeof incidentCreateSchema>;
export type IncidentCreateOutput = z.output<typeof incidentCreateSchema>;

export const incidentFilterSchema = z.object({
  state: z.string().optional(),
  reason_category: z.string().optional(),
  status: z.string().optional(),
  verified: z.enum(["true", "false"]).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  authority: z.string().optional(),
  id: z.string().uuid().optional(),
});
