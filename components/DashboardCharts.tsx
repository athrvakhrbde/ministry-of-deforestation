"use client";

import dynamic from "next/dynamic";
import type { StatsResponse } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/constants";
import type { ReasonCategory } from "@/lib/types";

const BarChartBlock = dynamic(
  () => import("@/components/charts/BarChartBlock"),
  { ssr: false, loading: () => <ChartPlaceholder /> }
);

const LineChartBlock = dynamic(
  () => import("@/components/charts/LineChartBlock"),
  { ssr: false, loading: () => <ChartPlaceholder /> }
);

function ChartPlaceholder() {
  return (
    <div className="h-full flex items-center justify-center font-data text-[10px] text-muted">
      LOADING CHART...
    </div>
  );
}

export default function DashboardCharts({ stats }: { stats: StatsResponse }) {
  const chartData = stats.by_category.map((c) => ({
    name: CATEGORY_LABELS[c.reason_category as ReasonCategory] ?? c.reason_category,
    count: c.count,
    fill: CATEGORY_COLORS[c.reason_category as ReasonCategory] ?? "#6b6b5a",
  }));

  const lineData = stats.by_month.map((m) => ({
    month: m.month,
    count: m.count,
  }));

  return (
    <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <div className="gov-card h-64 sm:h-72 lg:h-80 !p-3 sm:!p-4">
        <p className="gov-label">Incidents by reason category</p>
        <div className="h-[calc(100%-2rem)]">
          <BarChartBlock data={chartData} />
        </div>
      </div>
      <div className="gov-card h-64 sm:h-72 lg:h-80 !p-3 sm:!p-4">
        <p className="gov-label">Incidents over time (24 months)</p>
        <div className="h-[calc(100%-2rem)]">
          <LineChartBlock data={lineData} />
        </div>
      </div>
    </div>
  );
}
