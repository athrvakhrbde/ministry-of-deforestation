import Link from "next/link";

interface PageHeaderProps {
  backHref?: string;
  backLabel?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
}

export default function PageHeader({
  backHref = "/",
  backLabel = "← Back to map",
  title,
  subtitle,
  badge,
}: PageHeaderProps) {
  return (
    <header className="border-b border-paper/20 bg-black shrink-0">
      <div className="page-content !py-3 sm:!py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <Link
          href={backHref}
          prefetch={false}
          className="font-data text-xs text-muted hover:text-paper w-fit min-h-touch flex items-center"
        >
          {backLabel}
        </Link>
        {badge && (
          <span className="font-data text-2xs text-muted uppercase sm:ml-auto">
            {badge}
          </span>
        )}
      </div>
      {(title || subtitle) && (
        <div className="page-content !pt-0 !pb-4 sm:!pb-6">
          {title && (
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-paper">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="font-data text-sm text-muted mt-2 max-w-prose">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </header>
  );
}
