"use client";

import {
  INDIAN_STATES,
  REASON_CATEGORIES,
  STATUS_OPTIONS,
} from "@/lib/constants";
import type { MapFilters } from "@/lib/types";
import type { ReasonCategory, IncidentStatus } from "@/lib/types";

interface FilterPanelProps {
  filters: MapFilters;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSetState: (state: string) => void;
  onToggleCategory: (cat: ReasonCategory) => void;
  onSetAuthority: (authority: string) => void;
  onSetDateRange: (range: MapFilters["dateRange"]) => void;
  onToggleStatus: (status: IncidentStatus) => void;
  onSetVerifiedOnly: (v: boolean) => void;
  onClearAll: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function FilterPanel({
  filters,
  collapsed,
  onToggleCollapse,
  onSetState,
  onToggleCategory,
  onSetAuthority,
  onSetDateRange,
  onToggleStatus,
  onSetVerifiedOnly,
  onClearAll,
  mobileOpen,
  onMobileClose,
}: FilterPanelProps) {
  const content = (
    <div className="flex flex-col h-full overflow-y-auto overscroll-contain p-4 sm:p-5 gap-4 sm:gap-5 pb-8">
      <div className="flex items-center justify-between gap-2">
        <p className="gov-label !mb-0">Filter by classification</p>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden md:block text-muted hover:text-paper text-xs font-data min-h-touch sm:min-h-0 px-2"
          aria-label={collapsed ? "Expand filters" : "Collapse filters"}
        >
          {collapsed ? "▸" : "◂"}
        </button>
        {onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            className="md:hidden text-muted hover:text-paper font-data text-xl min-h-touch min-w-touch flex items-center justify-center"
            aria-label="Close filters"
          >
            ×
          </button>
        )}
      </div>
      <hr className="hr-faint !mt-0" />

      <div>
        <label htmlFor="filter-state" className="gov-label">
          State
        </label>
        <input
          id="filter-state"
          list="states-list"
          value={filters.state}
          onChange={(e) => onSetState(e.target.value)}
          placeholder="Search state..."
          className="gov-input"
        />
        <datalist id="states-list">
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>

      <div>
        <span className="gov-label">Reason category</span>
        <div className="flex flex-wrap gap-2">
          {REASON_CATEGORIES.map((cat) => {
            const active = filters.reasonCategories.includes(cat.value);
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => onToggleCategory(cat.value)}
                className={`gov-chip ${active ? "gov-chip-active" : "gov-chip-inactive"}`}
              >
                {cat.icon} {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="filter-authority" className="gov-label">
          Authority
        </label>
        <input
          id="filter-authority"
          value={filters.authority}
          onChange={(e) => onSetAuthority(e.target.value)}
          placeholder="NHAI, BMRCL, MCD..."
          className="gov-input"
        />
      </div>

      <div>
        <span className="gov-label">Date range</span>
        <div className="flex flex-col gap-2 font-data text-xs sm:text-sm">
          {(
            [
              ["30d", "Last 30 days"],
              ["1y", "1 Year"],
              ["5y", "5 Years"],
              ["all", "All Time"],
            ] as const
          ).map(([val, label]) => (
            <label
              key={val}
              className="flex items-center gap-3 cursor-pointer min-h-touch sm:min-h-0 py-0.5"
            >
              <input
                type="radio"
                name="dateRange"
                checked={filters.dateRange === val}
                onChange={() => onSetDateRange(val)}
                className="accent-red-stamp w-4 h-4"
              />
              <span className={filters.dateRange === val ? "text-paper" : "text-muted"}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className="gov-label">Status</span>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => {
            const active = filters.statuses.includes(s.value);
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => onToggleStatus(s.value)}
                className={`gov-chip ${active ? "gov-chip-active" : "gov-chip-inactive"}`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="gov-label !mb-0">Verified only</span>
        <button
          type="button"
          role="switch"
          aria-checked={filters.verifiedOnly}
          onClick={() => onSetVerifiedOnly(!filters.verifiedOnly)}
          className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${
            filters.verifiedOnly ? "bg-green-forest" : "bg-muted/40"
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-paper rounded-full transition-transform ${
              filters.verifiedOnly ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <button
        type="button"
        onClick={onClearAll}
        className="font-data text-xs text-red-stamp hover:underline text-left min-h-touch sm:min-h-0 flex items-center"
      >
        CLEAR ALL FILTERS
      </button>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden md:flex flex-col bg-black border-r border-paper/10 transition-all duration-panel shrink-0 ${
          collapsed ? "w-0 overflow-hidden border-r-0" : "w-sidebar max-w-[40vw]"
        }`}
      >
        {!collapsed && content}
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            onClick={onMobileClose}
            aria-hidden
          />
          <div
            className="relative bg-black border-t border-paper/20 rounded-t-xl max-h-[min(85dvh,32rem)] flex flex-col shadow-2xl"
            style={{ paddingBottom: "var(--safe-bottom)" }}
            role="dialog"
            aria-label="Map filters"
          >
            <div className="sheet-handle" />
            {content}
          </div>
        </div>
      )}
    </>
  );
}
