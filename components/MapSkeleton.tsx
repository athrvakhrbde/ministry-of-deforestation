/** Static HTML placeholder — paints before map JS loads */
export default function MapSkeleton() {
  return (
    <div
      className="absolute inset-0 bg-[#0d0d0b] overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(ellipse_at_center,#2ecc71_0%,transparent_70%)]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="font-data text-[10px] text-muted tracking-widest animate-pulse">
          INITIALIZING TERRAIN MAP...
        </p>
      </div>
    </div>
  );
}
