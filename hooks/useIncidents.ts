"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Incident } from "@/lib/types";

export function useIncidents(
  queryString: string,
  initialIncidents?: Incident[]
) {
  const hasInitial = Boolean(initialIncidents?.length);
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents ?? []);
  const [loading, setLoading] = useState(!hasInitial);
  const [error, setError] = useState<string | null>(null);
  const initialQuery = useRef(queryString);

  const fetchIncidents = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      try {
        const url = queryString
          ? `/api/incidents?${queryString}`
          : "/api/incidents";
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to fetch");
        setIncidents(data.incidents ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        if (!silent && !hasInitial) setIncidents([]);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [queryString, hasInitial]
  );

  useEffect(() => {
    if (queryString === initialQuery.current && hasInitial) {
      initialQuery.current = "__fetched__";
      return;
    }
    fetchIncidents();
  }, [fetchIncidents, queryString, hasInitial]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchIncidents(true);
    };
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchIncidents(true);
    }, 90000);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchIncidents]);

  const addIncident = useCallback((incident: Incident) => {
    setIncidents((prev) => {
      if (prev.some((i) => i.id === incident.id)) return prev;
      return [incident, ...prev];
    });
  }, []);

  return { incidents, loading, error, refetch: fetchIncidents, addIncident, setIncidents };
}
