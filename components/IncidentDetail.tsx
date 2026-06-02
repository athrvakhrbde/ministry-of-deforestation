"use client";

import Link from "next/link";
import type { Incident } from "@/lib/types";
import IncidentSidebar from "./IncidentSidebar";

export default function IncidentDetail({ incident }: { incident: Incident }) {
  return (
    <div className="w-full pb-8">
      <IncidentSidebar
        incident={incident}
        onClose={() => {}}
        embedded
      />
      <div className="pt-6 text-center border-t border-paper/10 mt-6">
        <Link
          href="/"
          prefetch={false}
          className="font-data text-xs text-muted hover:text-paper min-h-touch inline-flex items-center justify-center"
        >
          ← RETURN TO OPERATIONS MAP
        </Link>
      </div>
    </div>
  );
}
