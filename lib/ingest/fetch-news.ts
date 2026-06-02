import Parser from "rss-parser";
import type { RawArticle } from "./types";

const parser = new Parser({
  timeout: 15000,
  headers: { "User-Agent": "MinistryOfDeforestation/1.0 (civic news ingest)" },
});

/** RSS feeds — Indian environmental / general news search */
export const NEWS_FEEDS = [
  {
    name: "Google News — Tree felling India",
    url: "https://news.google.com/rss/search?q=tree+felling+India+OR+deforestation+India+when:7d&hl=en-IN&gl=IN&ceid=IN:en",
  },
  {
    name: "Google News — Forest clearance",
    url: "https://news.google.com/rss/search?q=forest+clearance+India+OR+NGT+trees+when:7d&hl=en-IN&gl=IN&ceid=IN:en",
  },
  {
    name: "Down To Earth",
    url: "https://www.downtoearth.org.in/rss/forests",
  },
  {
    name: "The Hindu — Environment",
    url: "https://www.thehindu.com/sci-tech/energy-and-environment/feeder/default.rss",
  },
];

async function fetchGdeltArticles(): Promise<RawArticle[]> {
  const query = encodeURIComponent(
    '(deforestation OR "tree felling" OR "forest clearance") India'
  );
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=ArtList&maxrecords=30&format=json&timespan=7d`;

  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return [];
    const data = await res.json();
    const articles = data.articles ?? [];
    return articles.map(
      (a: {
        title: string;
        seendate: string;
        url: string;
        domain: string;
        socialimage?: string;
      }) => ({
        title: a.title ?? "Untitled",
        summary: `Reported via ${a.domain ?? "GDELT"}.`,
        url: a.url,
        publishedAt: parseGdeltDate(a.seendate),
        sourceName: a.domain ?? "GDELT",
      })
    );
  } catch {
    return [];
  }
}

function parseGdeltDate(seendate: string): string {
  // format: 20240602120000
  if (!seendate || seendate.length < 8) return new Date().toISOString();
  const y = seendate.slice(0, 4);
  const m = seendate.slice(4, 6);
  const d = seendate.slice(6, 8);
  return new Date(`${y}-${m}-${d}T00:00:00Z`).toISOString();
}

async function fetchRssFeed(feed: { name: string; url: string }): Promise<RawArticle[]> {
  try {
    const parsed = await parser.parseURL(feed.url);
    return (parsed.items ?? []).map((item) => ({
      title: item.title ?? "Untitled",
      summary: (item.contentSnippet ?? item.content ?? "").replace(/<[^>]+>/g, "").slice(0, 1500),
      url: item.link ?? item.guid ?? "",
      publishedAt: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
      sourceName: feed.name,
    })).filter((a) => a.url.startsWith("http"));
  } catch (e) {
    console.error(`RSS fetch failed: ${feed.name}`, e);
    return [];
  }
}

export async function fetchAllNewsArticles(): Promise<RawArticle[]> {
  const results = await Promise.all([
    ...NEWS_FEEDS.map(fetchRssFeed),
    fetchGdeltArticles(),
  ]);

  const seen = new Set<string>();
  const merged: RawArticle[] = [];

  for (const batch of results) {
    for (const article of batch) {
      const key = article.url;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      merged.push(article);
    }
  }

  return merged.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
