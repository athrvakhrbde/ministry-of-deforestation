"use client";

import { formatIndianNumber } from "@/lib/constants";

interface StatsTickerProps {
  totalTrees: number;
  statesCount: number;
  incidentCount: number;
  ngtCount: number;
}

export default function StatsTicker({
  totalTrees,
  statesCount,
  incidentCount,
  ngtCount,
}: StatsTickerProps) {
  const text = `▸ ${formatIndianNumber(totalTrees)} TREES LOGGED · ${statesCount} STATES · ${formatIndianNumber(incidentCount)} INCIDENTS · ${ngtCount} NGT CASES ACTIVE ▸`;

  const items = [
    { label: "TREES", value: formatIndianNumber(totalTrees) },
    { label: "STATES", value: String(statesCount) },
    { label: "INCIDENTS", value: formatIndianNumber(incidentCount) },
    { label: "NGT", value: String(ngtCount) },
  ];

  return (
    <>
      {/* Mobile & tablet: compact stat strip */}
      <div className="md:hidden border-t border-paper/10 bg-black/80 px-3 py-2 grid grid-cols-4 gap-1 shrink-0">
        {items.map((item) => (
          <div key={item.label} className="text-center min-w-0">
            <p className="font-data text-2xs text-muted uppercase truncate">
              {item.label}
            </p>
            <p className="font-stat text-base sm:text-lg text-red-stamp leading-none truncate">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Desktop: marquee */}
      <div className="hidden md:flex flex-1 overflow-hidden min-w-0 mx-2 lg:mx-4">
        <div className="ticker-track font-data text-xs lg:text-sm text-red-stamp w-full">
          <span className="px-8">{text}</span>
          <span className="px-8">{text}</span>
        </div>
      </div>
    </>
  );
};
