"use client";

import dynamic from "next/dynamic";
import MapSkeleton from "./MapSkeleton";
import type { Incident } from "@/lib/types";

const MapView = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export default function MapLoader(props: {
  incidents: Incident[];
  selectedId: string | null;
  onSelectIncident: (incident: Incident | null) => void;
  newIncidentIds?: Set<string>;
}) {
  return (
    <div className="relative flex-1 min-h-0 w-full h-full min-w-0">
      <MapView {...props} />
    </div>
  );
}
