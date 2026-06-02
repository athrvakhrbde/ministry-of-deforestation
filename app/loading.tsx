export default function Loading() {
  return (
    <div className="app-shell">
      <header className="border-b border-paper/20 px-4 flex items-center min-h-[52px] sm:min-h-[60px]">
        <div className="font-display text-base sm:text-[22px] text-paper/80">
          MINISTRY OF DEFORESTATION
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center px-4">
        <p className="font-data text-xs text-muted tracking-widest animate-pulse text-center">
          LOADING CLASSIFIED DOSSIER...
        </p>
      </div>
    </div>
  );
}
