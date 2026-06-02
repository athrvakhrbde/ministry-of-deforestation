import { CATEGORY_COLORS, CATEGORY_LABELS, REASON_CATEGORIES } from "@/lib/constants";
import type { ReasonCategory } from "@/lib/types";

function getRotation(category: ReasonCategory): number {
  const hash = category.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return ((hash % 5) - 2);
}

export default function StampBadge({
  reason_category,
  size = "md",
}: {
  reason_category: ReasonCategory;
  size?: "sm" | "md";
}) {
  const color = CATEGORY_COLORS[reason_category];
  const label = CATEGORY_LABELS[reason_category];
  const icon = REASON_CATEGORIES.find((c) => c.value === reason_category)?.icon ?? "📋";
  const rotation = getRotation(reason_category);

  return (
    <div
      className={`inline-flex items-center gap-2 border-2 px-3 py-1 font-stat tracking-wider ${
        size === "sm" ? "text-xs" : "text-sm"
      }`}
      style={{
        borderColor: color,
        color,
        transform: `rotate(${rotation}deg)`,
        boxShadow: `2px 2px 0 ${color}33`,
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}
