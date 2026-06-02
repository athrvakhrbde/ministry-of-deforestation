import type { ReasonCategory } from "./types";
import { CATEGORY_COLORS } from "./constants";

export const MAPBOX_TOKEN_STORAGE_KEY = "mod_mapbox_token";

export const MAP_STYLE = "mapbox://styles/mapbox/dark-v11";

/** Free dark basemap when no Mapbox token (Carto) */
export const FREE_MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

/** India bounding box: [west, south, east, north] */
export const INDIA_BOUNDS: [number, number, number, number] = [68.1, 6.5, 97.4, 35.7];

export const INDIA_CENTER = {
  longitude: 82.75,
  latitude: 21.1,
  zoom: 4.2,
};

/** Read Mapbox token from env (build-time) or localStorage (runtime, dev). */
export function getMapboxToken(): string {
  const fromEnv = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim() ?? "";
  if (fromEnv && fromEnv !== "pk.your_mapbox_token_here") {
    return fromEnv;
  }
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(MAPBOX_TOKEN_STORAGE_KEY)?.trim();
    if (stored?.startsWith("pk.")) return stored;
  }
  return "";
}

export function saveMapboxToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MAPBOX_TOKEN_STORAGE_KEY, token.trim());
}

export function isValidMapboxToken(token: string): boolean {
  return token.startsWith("pk.") && token.length > 20;
}

export function getCategoryColor(category: ReasonCategory): string {
  return CATEGORY_COLORS[category];
}
