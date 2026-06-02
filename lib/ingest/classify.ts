import { createHash } from "crypto";
import { INDIAN_STATES } from "@/lib/constants";
import type { ReasonCategory } from "@/lib/types";
import type { RawArticle, ParsedIncidentDraft } from "./types";
import { STATE_ALIASES, STATE_CENTROIDS } from "./state-centroids";

const KEYWORDS = [
  "tree felling",
  "tree cutting",
  "trees cut",
  "trees felled",
  "deforestation",
  "forest clearance",
  "forest cleared",
  "green cover",
  "tree cover",
  "axing trees",
  "chopping trees",
  "illegal logging",
  "forest diversion",
  "fell trees",
  "cut trees",
  "vanishing trees",
  "tree loss",
];

const CATEGORY_RULES: { category: ReasonCategory; patterns: RegExp[] }[] = [
  { category: "metro_rail", patterns: [/metro\b/i, /rail\s*(corridor|project|line)/i, /mmrcl|dmrc|hmrl|kmrl/i] },
  { category: "road_widening", patterns: [/nhai\b/i, /highway/i, /road\s*widening/i, /expressway/i, /\bnh[-\s]?\d+/i] },
  { category: "power_infra", patterns: [/power\s*grid/i, /transmission\s*line/i, /powergrid/i, /thermal\s*plant/i] },
  { category: "mining", patterns: [/mining/i, /coal\s*(mine|plant)/i, /mineral/i] },
  { category: "real_estate", patterns: [/real\s*estate/i, /it\s*park/i, /smart\s*city/i, /housing\s*project/i] },
  { category: "urban_beautification", patterns: [/beautification/i, /central\s*vista/i, /landscaping/i] },
  { category: "disaster_clearance", patterns: [/flood/i, /cyclone/i, /landslide/i, /embankment/i] },
  { category: "illegal", patterns: [/illegal/i, /unauthorized/i, /no\s*clearance/i, /without\s*permission/i] },
];

const AUTHORITY_PATTERNS: { name: string; pattern: RegExp }[] = [
  { name: "NHAI", pattern: /\bnhai\b/i },
  { name: "BMRCL", pattern: /\bbmrcl\b/i },
  { name: "MMRCL", pattern: /\bmmrcl\b/i },
  { name: "POWERGRID", pattern: /\bpowergrid\b/i },
  { name: "Forest Department", pattern: /forest\s*department/i },
  { name: "Municipal Corporation", pattern: /municipal/i },
];

export function isRelevantArticle(article: RawArticle): boolean {
  const text = `${article.title} ${article.summary}`.toLowerCase();
  return KEYWORDS.some((kw) => text.includes(kw));
}

export function hashSource(url: string, title: string): string {
  return createHash("sha256").update(`${url}|${title}`).digest("hex").slice(0, 32);
}

function detectState(text: string): string {
  const lower = text.toLowerCase();
  for (const state of INDIAN_STATES) {
    if (lower.includes(state.toLowerCase())) return state;
  }
  for (const [alias, state] of Object.entries(STATE_ALIASES)) {
    if (lower.includes(alias)) return state;
  }
  return "India";
}

function detectCategory(text: string): ReasonCategory {
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((p) => p.test(text))) return rule.category;
  }
  return "illegal";
}

function detectAuthority(text: string): string | null {
  for (const { name, pattern } of AUTHORITY_PATTERNS) {
    if (pattern.test(text)) return name;
  }
  return null;
}

function extractTreeCount(text: string): number | null {
  const patterns = [
    /(\d[\d,]*)\s*(?:trees?|saplings?)\s*(?:felled|cut|chopped|axed|removed)/i,
    /(?:felled|cut|chopped|axed|removed)\s*(\d[\d,]*)\s*(?:trees?|saplings?)/i,
    /(\d[\d,]*)\s*(?:trees?|saplings?)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const n = parseInt(m[1].replace(/,/g, ""), 10);
      if (n > 0 && n < 500000) return n;
    }
  }
  return null;
}

function extractNgt(text: string): string | null {
  const m = text.match(/NGT[\/\s#-]*[\w/-]+/i);
  return m ? m[0].toUpperCase() : null;
}

function jitterCoord([lat, lng]: [number, number], seed: string): [number, number] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i)) % 1000;
  const offset = ((h % 100) - 50) / 500;
  return [lat + offset, lng + offset * 1.2];
}

export function articleToIncident(article: RawArticle): ParsedIncidentDraft | null {
  if (!isRelevantArticle(article)) return null;

  const text = `${article.title}. ${article.summary}`;
  const state = detectState(text);
  const centroid = STATE_CENTROIDS[state] ?? [22.5, 79.0];
  const [lat, lng] = jitterCoord(centroid, article.url);
  const category = detectCategory(text);
  const treeCount = extractTreeCount(text);

  return {
    source_hash: hashSource(article.url, article.title),
    location_name: article.title.slice(0, 200),
    state: state === "India" ? "Maharashtra" : state,
    district: null,
    lat,
    lng,
    tree_count: treeCount,
    species: null,
    reason_category: category,
    reason_detail: article.summary.slice(0, 2000) || article.title,
    project_name: article.sourceName,
    authority: detectAuthority(text),
    ministry: null,
    clearance_status: /no clearance|illegal|unauthorized/i.test(text)
      ? "no_clearance"
      : /under review|pending/i.test(text)
        ? "under_review"
        : "under_review",
    ngt_case: extractNgt(text),
    source_url: article.url,
    source_type: "news",
    verified: false,
    status: /halt|stay|court|ngt.*stop/i.test(text) ? "halted" : "ongoing",
    created_at: article.publishedAt,
  };
}
