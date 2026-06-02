import Link from "next/link";
import { format } from "date-fns";
import { getAllIncidents } from "@/lib/get-incident";
import { aggregateStats } from "@/lib/stats";
import { formatIndianNumber } from "@/lib/constants";
import DashboardCharts from "@/components/DashboardCharts";
import PageHeader from "@/components/PageHeader";

export const revalidate = 120;

export default async function DashboardPage() {
  const incidents = await getAllIncidents();
  const stats = aggregateStats(incidents);
  const updatedAt = new Date().toISOString();

  return (
    <div className="page-shell">
      <PageHeader
        backLabel="← Operations map"
        badge={`Updated ${format(new Date(updatedAt), "dd MMM yyyy HH:mm").toUpperCase()}`}
        title="CLASSIFIED STATISTICS"
      />

      <main className="page-content !pt-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { label: "TOTAL INCIDENTS", value: stats.total_incidents },
            { label: "TOTAL TREES LOGGED", value: stats.total_trees },
            { label: "STATES AFFECTED", value: stats.states_affected },
            { label: "ACTIVE NGT CASES", value: stats.ngt_cases },
          ].map((card) => (
            <div key={card.label} className="gov-card-stat">
              <p className="gov-label !text-2xs sm:!text-[10px]">{card.label}</p>
              <p className="font-stat text-3xl sm:text-4xl lg:text-5xl text-red-stamp mt-1 sm:mt-2 leading-none">
                {formatIndianNumber(card.value)}
              </p>
            </div>
          ))}
        </div>

        <DashboardCharts stats={stats} />

        <div className="gov-card mb-6 sm:mb-8 overflow-hidden !p-0">
          <p className="gov-label !mb-0 px-4 pt-4 pb-3 border-b border-paper/10">
            Top 10 authorities — government ledger
          </p>
          <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
            <table className="w-full font-data text-xs min-w-[32rem]">
              <thead>
                <tr className="text-muted border-b border-paper/10">
                  <th className="text-left p-3">Authority</th>
                  <th className="text-right p-3">Incidents</th>
                  <th className="text-right p-3">Trees</th>
                  <th className="text-right p-3">States</th>
                  <th className="text-right p-3">Clearance</th>
                </tr>
              </thead>
              <tbody>
                {stats.top_authorities.map((row, i) => (
                  <tr key={row.authority} className={i % 2 === 0 ? "bg-paper/5" : ""}>
                    <td className="p-3 max-w-[10rem] sm:max-w-none truncate sm:whitespace-normal">
                      {row.authority}
                    </td>
                    <td className="p-3 text-right tabular-nums">{row.count}</td>
                    <td className="p-3 text-right tabular-nums">
                      {formatIndianNumber(row.trees)}
                    </td>
                    <td className="p-3 text-right tabular-nums">{row.states}</td>
                    <td className="p-3 text-right tabular-nums">{row.clearance_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <div className="gov-card">
            <p className="gov-label">State leaderboard</p>
            <ul className="space-y-2.5">
              {stats.by_state.slice(0, 10).map((s, i) => {
                const max = stats.by_state[0]?.count ?? 1;
                return (
                  <li
                    key={s.state}
                    className="flex items-center gap-2 sm:gap-3 font-data text-xs"
                  >
                    <span className="text-muted w-4 shrink-0">{i + 1}</span>
                    <span className="flex-1 min-w-0 truncate">{s.state}</span>
                    <div className="w-16 sm:w-24 h-2 bg-muted/20 shrink-0">
                      <div
                        className="h-full bg-red-stamp"
                        style={{ width: `${(s.count / max) * 100}%` }}
                      />
                    </div>
                    <span className="text-muted w-8 text-right tabular-nums shrink-0">
                      {s.count}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="gov-card">
            <p className="gov-label">Recent incidents</p>
            <ul className="space-y-2">
              {stats.recent_incidents.map((inc) => (
                <li
                  key={inc.id}
                  className="font-data text-xs flex items-start sm:items-center gap-2"
                >
                  <Link
                    href={`/incident/${inc.id}`}
                    prefetch={false}
                    className="flex-1 min-w-0 hover:text-red-stamp line-clamp-2 sm:truncate"
                  >
                    {inc.location_name} — {inc.state}
                  </Link>
                  <span
                    className={`text-2xs sm:text-[9px] px-1.5 py-0.5 border shrink-0 ${
                      inc.status === "ongoing"
                        ? "border-red-stamp text-red-stamp"
                        : inc.status === "halted"
                          ? "border-green-forest text-green-forest"
                          : "border-muted text-muted"
                    }`}
                  >
                    {inc.status.toUpperCase()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
