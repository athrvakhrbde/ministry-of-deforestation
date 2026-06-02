import type { ReasonCategory, ClearanceStatus } from "./types";

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

export const REASON_CATEGORIES: {
  value: ReasonCategory;
  label: string;
  icon: string;
}[] = [
  { value: "road_widening", label: "Road Widening", icon: "🛣️" },
  { value: "metro_rail", label: "Metro / Rail", icon: "🚇" },
  { value: "power_infra", label: "Power Infrastructure", icon: "⚡" },
  { value: "real_estate", label: "Real Estate", icon: "🏗️" },
  { value: "mining", label: "Mining", icon: "⛏️" },
  { value: "urban_beautification", label: "Urban Beautification", icon: "🌳" },
  { value: "disaster_clearance", label: "Disaster Clearance", icon: "🌀" },
  { value: "illegal", label: "Illegal / No Clearance", icon: "⚠️" },
];

export const CATEGORY_COLORS: Record<ReasonCategory, string> = {
  road_widening: "#e67e22",
  metro_rail: "#3498db",
  power_infra: "#f1c40f",
  real_estate: "#9b59b6",
  mining: "#e74c3c",
  urban_beautification: "#1abc9c",
  disaster_clearance: "#95a5a6",
  illegal: "#c0392b",
};

export const CATEGORY_LABELS: Record<ReasonCategory, string> = {
  road_widening: "ROAD WIDENING",
  metro_rail: "METRO / RAIL",
  power_infra: "POWER INFRA",
  real_estate: "REAL ESTATE",
  mining: "MINING",
  urban_beautification: "URBAN BEAUTIFICATION",
  disaster_clearance: "DISASTER CLEARANCE",
  illegal: "ILLEGAL / NO CLEARANCE",
};

export const STATUS_OPTIONS = [
  { value: "ongoing" as const, label: "ONGOING" },
  { value: "completed" as const, label: "COMPLETED" },
  { value: "halted" as const, label: "HALTED BY COURT" },
];

export const CLEARANCE_OPTIONS: {
  value: ClearanceStatus;
  label: string;
  stampClass: string;
}[] = [
  { value: "cleared", label: "CLEARANCE GRANTED", stampClass: "text-green-forest border-green-forest" },
  { value: "no_clearance", label: "NO CLEARANCE", stampClass: "text-red-stamp border-red-stamp" },
  { value: "under_review", label: "UNDER REVIEW", stampClass: "text-amber-warn border-amber-warn" },
];

export const SOURCE_TYPES = [
  { value: "crowdsourced", label: "CROWDSOURCED" },
  { value: "news", label: "NEWS" },
  { value: "rti", label: "RTI" },
  { value: "scraped", label: "SCRAPED" },
];

export function formatIndianNumber(n: number): string {
  const s = Math.round(n).toString();
  if (s.length <= 3) return s;
  const lastThree = s.slice(-3);
  const rest = s.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${grouped},${lastThree}`;
}

export function getMarkerSize(treeCount: number | null): number {
  const count = treeCount ?? 1;
  const size = 12 + 8 * Math.log10(Math.max(count, 1));
  return Math.min(32, Math.max(12, size));
}
