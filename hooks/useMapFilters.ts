"use client";

import { useCallback, useMemo, useState } from "react";
import type { MapFilters, ReasonCategory, IncidentStatus } from "@/lib/types";
import { subDays, subYears } from "date-fns";

const DEFAULT_FILTERS: MapFilters = {
  state: "",
  reasonCategories: [],
  authority: "",
  dateRange: "all",
  statuses: [],
  verifiedOnly: false,
};

export function useMapFilters() {
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS);
  const [collapsed, setCollapsed] = useState(false);

  const setState = useCallback((state: string) => {
    setFilters((f) => ({ ...f, state }));
  }, []);

  const toggleCategory = useCallback((cat: ReasonCategory) => {
    setFilters((f) => {
      const exists = f.reasonCategories.includes(cat);
      return {
        ...f,
        reasonCategories: exists
          ? f.reasonCategories.filter((c) => c !== cat)
          : [...f.reasonCategories, cat],
      };
    });
  }, []);

  const setAuthority = useCallback((authority: string) => {
    setFilters((f) => ({ ...f, authority }));
  }, []);

  const setDateRange = useCallback((dateRange: MapFilters["dateRange"]) => {
    setFilters((f) => ({ ...f, dateRange }));
  }, []);

  const toggleStatus = useCallback((status: IncidentStatus) => {
    setFilters((f) => {
      const exists = f.statuses.includes(status);
      return {
        ...f,
        statuses: exists
          ? f.statuses.filter((s) => s !== status)
          : [...f.statuses, status],
      };
    });
  }, []);

  const setVerifiedOnly = useCallback((verifiedOnly: boolean) => {
    setFilters((f) => ({ ...f, verifiedOnly }));
  }, []);

  const clearAll = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.state) params.set("state", filters.state);
    if (filters.reasonCategories.length)
      params.set("reason_category", filters.reasonCategories.join(","));
    if (filters.statuses.length)
      params.set("status", filters.statuses.join(","));
    if (filters.verifiedOnly) params.set("verified", "true");
    if (filters.authority) params.set("authority", filters.authority);

    const now = new Date();
    if (filters.dateRange === "30d")
      params.set("date_from", subDays(now, 30).toISOString());
    else if (filters.dateRange === "1y")
      params.set("date_from", subYears(now, 1).toISOString());
    else if (filters.dateRange === "5y")
      params.set("date_from", subYears(now, 5).toISOString());

    return params.toString();
  }, [filters]);

  return {
    filters,
    collapsed,
    setCollapsed,
    setState,
    toggleCategory,
    setAuthority,
    setDateRange,
    toggleStatus,
    setVerifiedOnly,
    clearAll,
    queryString,
  };
}
