import type { Incident } from "./types";

export function mergeIncidents(
  base: Incident[],
  extra: Incident[],
  dedupeBySource = true
): Incident[] {
  const seen = new Set<string>();
  const merged: Incident[] = [];

  for (const list of [extra, base]) {
    for (const inc of list) {
      const key = dedupeBySource
        ? inc.source_url ?? inc.id
        : inc.id;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(inc);
    }
  }

  return merged.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
