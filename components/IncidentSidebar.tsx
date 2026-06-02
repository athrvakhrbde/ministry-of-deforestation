"use client";

import Link from "next/link";
import { format } from "date-fns";
import type { Incident } from "@/lib/types";
import StampBadge from "./StampBadge";
import { CLEARANCE_OPTIONS } from "@/lib/constants";
import { ensureSourceUrl } from "@/lib/source-link";

interface IncidentSidebarProps {
  incident: Incident | null;
  onClose: () => void;
  /** Full-screen / overlay on phones & tablets */
  overlay?: boolean;
  /** Standalone dossier page (no close button, no fixed positioning) */
  embedded?: boolean;
}

function StatusPill({ status }: { status: Incident["status"] }) {
  const styles = {
    ongoing: "bg-red-stamp/20 text-red-stamp border-red-stamp",
    completed: "bg-muted/20 text-muted border-muted",
    halted: "bg-green-forest/20 text-green-forest border-green-forest",
  };
  const labels = {
    ongoing: "ONGOING",
    completed: "COMPLETED",
    halted: "HALTED BY COURT",
  };
  return (
    <span
      className={`font-data text-[10px] px-2 py-0.5 border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function ClearanceStamp({
  status,
}: {
  status: Incident["clearance_status"];
}) {
  if (!status) return null;
  const opt = CLEARANCE_OPTIONS.find((o) => o.value === status);
  if (!opt) return null;
  const isNoClearance = status === "no_clearance";

  return (
    <div
      className={`inline-block border-4 px-4 sm:px-6 py-2 sm:py-3 font-stat text-xl sm:text-2xl tracking-widest ${opt.stampClass} ${
        isNoClearance ? "rotate-[-8deg]" : ""
      }`}
    >
      {opt.label}
    </div>
  );
}

export default function IncidentSidebar({
  incident,
  onClose,
  overlay = false,
  embedded = false,
}: IncidentSidebarProps) {
  if (!incident) return null;

  const sourceUrl = ensureSourceUrl(
    incident.source_url,
    incident.location_name,
    incident.project_name
  );

  return (
    <>
      {overlay && !embedded && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={`bg-black flex flex-col overflow-hidden transition-transform duration-panel ${
          embedded
            ? "relative w-full border-0"
            : overlay
              ? "fixed inset-y-0 right-0 z-40 w-full max-w-dossier border-l border-paper/10 shadow-2xl lg:static lg:shadow-none lg:w-[min(24rem,38vw)] lg:shrink-0"
              : "w-full max-w-dossier shrink-0 border-l border-paper/10"
        }`}
        style={
          overlay && !embedded
            ? { paddingTop: "var(--safe-top)", paddingBottom: "var(--safe-bottom)" }
            : undefined
        }
        role={embedded ? undefined : "dialog"}
        aria-label={embedded ? undefined : "Incident details"}
      >
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 relative">
          {!embedded && (
            <button
              type="button"
              onClick={onClose}
              className="sticky top-0 float-right text-muted hover:text-paper text-2xl z-10 min-h-touch min-w-touch flex items-center justify-center -mr-1"
              aria-label="Close incident"
            >
              ×
            </button>
          )}

          <div className={`${embedded ? "mt-1" : "clear-both mt-1"} mb-4 ${embedded ? "" : "pr-10"}`}>
            <StampBadge reason_category={incident.reason_category} />
            <div className="mt-2">
              <StatusPill status={incident.status} />
            </div>
          </div>

          <hr className="hr-faint" />

          <section className="mt-4">
            <p className="gov-label">Location</p>
            <h3 className="font-display text-base sm:text-lg text-paper leading-snug">
              {incident.location_name}
            </h3>
            <p className="font-data text-xs text-muted mt-1">
              {incident.state}
              {incident.district ? ` · ${incident.district}` : ""}
            </p>
            <p className="font-data text-2xs text-muted/50 mt-1">
              {incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}
            </p>
          </section>

          <hr className="hr-faint" />

          <section className="mt-4">
            <p className="gov-label">Trees felled (est.)</p>
            <p className="font-stat text-4xl sm:text-5xl text-red-stamp leading-none mt-1">
              {incident.tree_count?.toLocaleString("en-IN") ?? "—"}
            </p>
            {incident.species && incident.species.length > 0 && (
              <>
                <p className="gov-label mt-4">Species on record</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {incident.species.map((s) => (
                    <span
                      key={s}
                      className="font-data text-2xs sm:text-[10px] border border-paper/20 px-2 py-0.5 max-w-full truncate"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </>
            )}
          {incident.project_name && (
            <p className="font-data text-xs mt-3 break-words">
              <span className="text-muted">SOURCE · </span>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-stamp hover:underline"
              >
                {incident.project_name}
              </a>
            </p>
          )}
            {incident.authority && (
              <p className="font-data text-xs mt-1 break-words">
                <span className="text-muted">AUTHORITY · </span>
                {incident.authority}
              </p>
            )}
            {incident.ministry && (
              <p className="font-data text-xs mt-1 break-words">
                <span className="text-muted">MINISTRY · </span>
                {incident.ministry}
              </p>
            )}
          </section>

          <hr className="hr-faint" />

          <section className="mt-4">
            <p className="gov-label">Clearance status</p>
            <ClearanceStamp status={incident.clearance_status} />
            {incident.ngt_case && (
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(incident.ngt_case)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 font-data text-[10px] border border-amber-warn text-amber-warn px-2 py-1.5 hover:bg-amber-warn/10 break-all"
              >
                NGT CASE: {incident.ngt_case}
              </a>
            )}
          </section>

          <hr className="hr-faint" />

          <section className="mt-4">
            <p className="gov-label">Evidence</p>
            {incident.source_type && (
              <span className="font-data text-[10px] border border-paper/30 px-2 py-0.5 uppercase">
                {incident.source_type}
              </span>
            )}
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block font-data text-xs text-red-stamp mt-2 hover:underline break-all"
            >
              READ ORIGINAL ARTICLE →
            </a>
            {incident.media_urls && incident.media_urls.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                {incident.media_urls.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt="Evidence"
                      className="w-full h-20 sm:h-24 object-cover border border-paper/20"
                    />
                  </a>
                ))}
              </div>
            )}
            <p className="font-data text-[10px] text-muted mt-3">
              FILED ON {format(new Date(incident.created_at), "dd MMM yyyy").toUpperCase()}
            </p>
          </section>

          <hr className="hr-faint" />

          <footer className="mt-4 pb-6 sm:pb-8">
            {incident.verified ? (
              <p className="font-stat text-base sm:text-lg text-green-forest border-2 border-green-forest inline-block px-3 py-1 rotate-[-2deg]">
                VERIFIED BY EDITORIAL TEAM
              </p>
            ) : (
              <p className="font-data text-xs text-muted">AWAITING VERIFICATION</p>
            )}
            {!embedded && (
              <Link
                href={`/incident/${incident.id}`}
                className="block font-data text-[10px] text-muted mt-4 hover:text-paper min-h-touch sm:min-h-0 flex items-center"
              >
                VIEW FULL DOSSIER →
              </Link>
            )}
          </footer>
        </div>
      </aside>
    </>
  );
}
