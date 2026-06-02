import type { Incident, StatsResponse } from "./types";
import { format, subMonths, parseISO } from "date-fns";

export function computeHeaderStats(incidents: Incident[]) {
  const totalTrees = incidents.reduce((s, i) => s + (i.tree_count ?? 0), 0);
  const states = new Set(incidents.map((i) => i.state));
  const ngtCount = incidents.filter((i) => i.ngt_case).length;
  return {
    totalTrees,
    statesCount: states.size,
    incidentCount: incidents.length,
    ngtCount,
  };
}

export function aggregateStats(incidents: Incident[]): StatsResponse {
  const total_incidents = incidents.length;
  const total_trees = incidents.reduce((s, i) => s + (i.tree_count ?? 0), 0);
  const states = new Set(incidents.map((i) => i.state));
  const ngt_cases = incidents.filter((i) => i.ngt_case).length;

  const categoryMap = new Map<string, number>();
  incidents.forEach((i) => {
    categoryMap.set(
      i.reason_category,
      (categoryMap.get(i.reason_category) ?? 0) + 1
    );
  });
  const by_category = Array.from(categoryMap.entries()).map(
    ([reason_category, count]) => ({ reason_category, count })
  );

  const monthMap = new Map<string, number>();
  const now = new Date();
  for (let m = 23; m >= 0; m--) {
    const d = subMonths(now, m);
    monthMap.set(format(d, "yyyy-MM"), 0);
  }
  incidents.forEach((i) => {
    const key = format(parseISO(i.created_at), "yyyy-MM");
    if (monthMap.has(key)) {
      monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
    }
  });
  const by_month = Array.from(monthMap.entries()).map(([month, count]) => ({
    month,
    count,
  }));

  const authMap = new Map<
    string,
    { count: number; trees: number; states: Set<string>; cleared: number }
  >();
  incidents.forEach((i) => {
    const auth = i.authority ?? "Unknown";
    const entry = authMap.get(auth) ?? {
      count: 0,
      trees: 0,
      states: new Set<string>(),
      cleared: 0,
    };
    entry.count++;
    entry.trees += i.tree_count ?? 0;
    entry.states.add(i.state);
    if (i.clearance_status === "cleared") entry.cleared++;
    authMap.set(auth, entry);
  });

  const top_authorities = Array.from(authMap.entries())
    .map(([authority, v]) => ({
      authority,
      count: v.count,
      trees: v.trees,
      states: v.states.size,
      clearance_rate: v.count ? Math.round((v.cleared / v.count) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const stateMap = new Map<string, number>();
  incidents.forEach((i) => {
    stateMap.set(i.state, (stateMap.get(i.state) ?? 0) + 1);
  });
  const by_state = Array.from(stateMap.entries())
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count);

  const recent_incidents = [...incidents]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 10);

  return {
    total_incidents,
    total_trees,
    states_affected: states.size,
    ngt_cases,
    by_category,
    by_month,
    top_authorities,
    by_state,
    recent_incidents,
  };
}
