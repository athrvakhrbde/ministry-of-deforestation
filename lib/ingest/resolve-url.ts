/**
 * Resolve Google News RSS redirect URLs to publisher URLs when possible.
 */
export async function resolveArticleUrl(
  url: string,
  timeoutMs = 8000
): Promise<string> {
  const trimmed = url?.trim();
  if (!trimmed.startsWith("http")) return trimmed;

  const isGoogleNews =
    trimmed.includes("news.google.com") || trimmed.includes("google.com/rss");

  if (!isGoogleNews) return trimmed;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(trimmed, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MinistryOfDeforestation/1.0; +https://ministry-of-deforestation.vercel.app)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    clearTimeout(timer);

    const finalUrl = res.url;
    if (
      finalUrl &&
      finalUrl.startsWith("http") &&
      !finalUrl.includes("news.google.com")
    ) {
      return finalUrl;
    }

    // Google News article pages sometimes embed canonical in HTML
    if (res.ok && res.headers.get("content-type")?.includes("text/html")) {
      const html = await res.text();
      const canonical = html.match(
        /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i
      )?.[1];
      if (canonical?.startsWith("http") && !canonical.includes("google.com")) {
        return canonical;
      }
      const ogUrl = html.match(
        /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i
      )?.[1];
      if (ogUrl?.startsWith("http") && !ogUrl.includes("google.com")) {
        return ogUrl;
      }
    }
  } catch {
    // Keep original Google redirect — still opens the article in browser
  }

  return trimmed;
}
