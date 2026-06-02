/** Build a working fallback when no publisher URL is available */
export function buildNewsSearchUrl(title: string, extra?: string): string {
  const q = [title, extra, "India", "trees"].filter(Boolean).join(" ");
  return `https://www.google.com/search?q=${encodeURIComponent(q)}&hl=en-IN`;
}

const PLACEHOLDER_HOSTS = ["mod.example", "example.com"];

export function isPlaceholderSourceUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return true;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return PLACEHOLDER_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return true;
  }
}

/** Ensure every incident has a clickable source link */
export function ensureSourceUrl(
  url: string | null | undefined,
  title: string,
  projectName?: string | null
): string {
  const trimmed = url?.trim() ?? "";
  if (trimmed.startsWith("http") && !isPlaceholderSourceUrl(trimmed)) {
    return trimmed;
  }
  return buildNewsSearchUrl(title, projectName ?? undefined);
}
