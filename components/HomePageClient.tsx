"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import LiveStatusBar from "@/components/LiveStatusBar";
import Toast from "@/components/Toast";
import MapLoader from "@/components/MapLoader";
import { useMapFilters } from "@/hooks/useMapFilters";
import { useIncidents } from "@/hooks/useIncidents";
import { useIngestStatus } from "@/hooks/useIngestStatus";
import { createClient } from "@/lib/supabase/client";
import type { Incident } from "@/lib/types";

const FilterPanel = dynamic(() => import("@/components/FilterPanel"), {
  loading: () => (
    <aside className="hidden md:block w-sidebar shrink-0 bg-black border-r border-paper/10" />
  ),
});

const IncidentSidebar = dynamic(() => import("@/components/IncidentSidebar"), {
  loading: () => null,
});

interface HomePageClientProps {
  initialIncidents: Incident[];
  initialStats: {
    totalTrees: number;
    statesCount: number;
    incidentCount: number;
    ngtCount: number;
  };
}

export default function HomePageClient({
  initialIncidents,
  initialStats,
}: HomePageClientProps) {
  const {
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
  } = useMapFilters();

  const { incidents, addIncident, refetch } = useIncidents(
    queryString,
    initialIncidents
  );

  const [ingestEnabled, setIngestEnabled] = useState(false);
  const { status: ingestStatus } = useIngestStatus(60000, ingestEnabled);

  const [stats, setStats] = useState(initialStats);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const totalTrees = incidents.reduce((s, i) => s + (i.tree_count ?? 0), 0);
    const states = new Set(incidents.map((i) => i.state));
    const ngt = incidents.filter((i) => i.ngt_case).length;
    setStats({
      totalTrees,
      statesCount: states.size,
      incidentCount: incidents.length,
      ngtCount: ngt,
    });
  }, [incidents]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    setIsNarrow(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsNarrow(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (isNarrow) return;
    setMobileFilters(false);
  }, [isNarrow]);

  useEffect(() => {
    const t = window.setTimeout(() => setIngestEnabled(true), 2500);
    return () => clearTimeout(t);
  }, []);

  const handleRealtimeInsert = useCallback(
    (incident: Incident) => {
      addIncident(incident);
      setNewIds((prev) => new Set(prev).add(incident.id));
      setToast(`NEW INCIDENT FILED: ${incident.location_name}`);
      setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev);
          next.delete(incident.id);
          return next;
        });
      }, 3000);
    },
    [addIncident]
  );

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    const supabase = createClient();
    const channel = supabase
      .channel("incidents-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "incidents" },
        (payload) => {
          handleRealtimeInsert(payload.new as Incident);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleRealtimeInsert]);

  const prevRunning = useRef(false);
  useEffect(() => {
    if (ingestStatus?.currently_running) {
      prevRunning.current = true;
      return;
    }
    if (prevRunning.current) {
      prevRunning.current = false;
      refetch();
    }
  }, [ingestStatus?.currently_running, refetch]);

  return (
    <div className="app-shell">
      <Header {...stats} />
      <LiveStatusBar status={ingestStatus} />

      <div className="flex-1 flex min-h-0 min-w-0 relative overflow-hidden">
        <FilterPanel
          filters={filters}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          onSetState={setState}
          onToggleCategory={toggleCategory}
          onSetAuthority={setAuthority}
          onSetDateRange={setDateRange}
          onToggleStatus={toggleStatus}
          onSetVerifiedOnly={setVerifiedOnly}
          onClearAll={clearAll}
          mobileOpen={mobileFilters}
          onMobileClose={() => setMobileFilters(false)}
        />

        <div className="flex-1 flex min-w-0 min-h-0 relative h-full">
          <MapLoader
            incidents={incidents}
            selectedId={selected?.id ?? null}
            onSelectIncident={setSelected}
            newIncidentIds={newIds}
          />

          {selected && (
            <IncidentSidebar
              incident={selected}
              onClose={() => setSelected(null)}
              overlay={isNarrow}
            />
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileFilters(true)}
          className="map-fab md:hidden"
          aria-expanded={mobileFilters}
        >
          FILTERS
        </button>
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
