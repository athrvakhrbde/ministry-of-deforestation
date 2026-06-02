"use client";

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AboutModal({ open, onClose }: AboutModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ paddingTop: "var(--safe-top)", paddingBottom: "var(--safe-bottom)" }}
      role="dialog"
      aria-modal
      aria-labelledby="about-title"
    >
      <div className="absolute inset-0 bg-black/80" onClick={onClose} aria-hidden />
      <div className="relative w-full sm:max-w-lg bg-black border-t sm:border border-paper/30 p-5 sm:p-6 max-h-[min(90dvh,36rem)] overflow-y-auto rounded-t-xl sm:rounded-none">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-paper font-data text-xl min-h-touch min-w-touch flex items-center justify-center"
          aria-label="Close"
        >
          ×
        </button>
        <h2
          id="about-title"
          className="font-display text-xl sm:text-2xl text-paper mb-2 pr-10"
        >
          CLASSIFIED — FOR PUBLIC RELEASE
        </h2>
        <p className="font-data text-xs text-muted mb-4">
          FILED UNDER: CIVIC ACCOUNTABILITY / ENVIRONMENT
        </p>
        <hr className="hr-faint" />
        <div className="font-data text-sm text-paper/90 space-y-4 mt-4">
          <p>
            The <strong>Ministry of Deforestation</strong> is a satirical civic accountability tool —
            not affiliated with any government body. It maps trees being felled across India due to
            infrastructure, mining, urban development, and illegal clearing.
          </p>
          <p>
            <strong>Data sources:</strong> Live news ingest (RSS + GDELT, refreshed twice daily),
            crowdsourced citizen reports, RTI disclosures, and public records.
          </p>
          <p>
            <strong>How to contribute:</strong> File a report with location, estimated tree count,
            project details, and evidence links. Editorial review applies before verification.
          </p>
          <p className="text-red-stamp text-xs">
            This platform exists because official tree-loss data is fragmented or inaccessible.
            Use it to demand transparency — not as legal evidence.
          </p>
        </div>
      </div>
    </div>
  );
}
