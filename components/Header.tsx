import Link from "next/link";
import StatsTicker from "./StatsTicker";

interface HeaderProps {
  totalTrees: number;
  statesCount: number;
  incidentCount: number;
  ngtCount: number;
}

function UpsideDownTree() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      className="inline-block ml-1.5 sm:ml-2 opacity-70 shrink-0"
      aria-hidden
    >
      <path
        d="M12 2 L20 14 L15 14 L17 22 L7 22 L9 14 L4 14 Z"
        fill="#2ecc71"
        transform="rotate(180 12 12)"
      />
      <line x1="5" y1="12" x2="19" y2="12" stroke="#c0392b" strokeWidth="1.5" />
    </svg>
  );
}

export default function Header({
  totalTrees,
  statesCount,
  incidentCount,
  ngtCount,
}: HeaderProps) {
  return (
    <header className="shrink-0 z-20 border-b border-paper/20 bg-black">
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 min-h-[52px] sm:min-h-[60px]">
        <div className="min-w-0 flex-1 sm:flex-initial sm:max-w-[min(100%,22rem)]">
          <Link
            href="/"
            prefetch={false}
            className="font-display text-[15px] xs:text-base sm:text-lg lg:text-[22px] text-paper leading-tight hover:opacity-90 block truncate"
          >
            <span className="xs:hidden">M.O. DEFORESTATION</span>
            <span className="hidden xs:inline">MINISTRY OF DEFORESTATION</span>
            <UpsideDownTree />
          </Link>
          <p className="font-data text-2xs sm:text-[10px] text-muted truncate">
            A PEOPLE&apos;S AUDIT · INDIA
          </p>
        </div>

        <nav className="hidden lg:flex items-center gap-4 shrink-0 ml-auto font-data text-xs text-muted">
          <Link href="/dashboard" prefetch={false} className="hover:text-paper">
            Dashboard
          </Link>
          <Link href="/submit" prefetch={false} className="hover:text-paper">
            File report
          </Link>
        </nav>

        {/* Inline ticker only on md+ (stats row is separate on mobile) */}
        <div className="hidden md:contents">
          <StatsTicker
            totalTrees={totalTrees}
            statesCount={statesCount}
            incidentCount={incidentCount}
            ngtCount={ngtCount}
          />
        </div>
      </div>

      {/* Mobile stats row */}
      <div className="md:hidden">
        <StatsTicker
          totalTrees={totalTrees}
          statesCount={statesCount}
          incidentCount={incidentCount}
          ngtCount={ngtCount}
        />
      </div>
    </header>
  );
}
