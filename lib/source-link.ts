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

/** NGT / tribunal orders — Indian Kanoon + official NGT portal */
export function buildNgtCaseUrl(
  ngtCase: string,
  context?: { location_name?: string; state?: string; project_name?: string | null }
): string {
  const parts = [
    ngtCase,
    "National Green Tribunal",
    context?.location_name,
    context?.state,
    context?.project_name,
    "order judgment India",
  ].filter(Boolean);
  return `https://indiankanoon.org/search/?formInput=${encodeURIComponent(parts.join(" "))}`;
}

export function buildNgtPortalUrl(ngtCase: string): string {
  const q = `site:greentribunal.gov.in ${ngtCase}`;
  return `https://www.google.com/search?q=${encodeURIComponent(q)}&hl=en-IN`;
}

/** Forest / environmental clearance (PARIVESH, MoEFCC records) */
export function buildClearanceRecordsUrl(
  context: {
    location_name: string;
    state: string;
    project_name?: string | null;
    clearance_status?: string | null;
  }
): string {
  const q = [
    context.project_name,
    context.location_name,
    context.state,
    "forest clearance",
    "PARIVESH",
    "environment clearance India",
    context.clearance_status === "no_clearance" ? "without clearance" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return `https://www.google.com/search?q=${encodeURIComponent(q)}&hl=en-IN`;
}

export function buildAuthorityRecordsUrl(
  authority: string,
  context?: { project_name?: string | null; location_name?: string }
): string {
  const q = [authority, context?.project_name, context?.location_name, "India forest trees"].filter(
    Boolean
  );
  return `https://www.google.com/search?q=${encodeURIComponent(q.join(" "))}&hl=en-IN`;
}

export function buildMinistryRecordsUrl(
  ministry: string,
  context?: { project_name?: string | null }
): string {
  const q = [ministry, context?.project_name, "forest clearance India"].filter(Boolean);
  return `https://www.google.com/search?q=${encodeURIComponent(q.join(" "))}&hl=en-IN`;
}

export function buildCourtOrderUrl(
  context: {
    location_name: string;
    state: string;
    project_name?: string | null;
    ngt_case?: string | null;
  }
): string {
  if (context.ngt_case) {
    return buildNgtCaseUrl(context.ngt_case, context);
  }
  const q = [
    context.project_name,
    context.location_name,
    context.state,
    "tree felling stay order court India",
  ].filter(Boolean);
  return `https://indiankanoon.org/search/?formInput=${encodeURIComponent(q.join(" "))}`;
}
