import { getAllIncidents } from "@/lib/get-incident";
import { computeHeaderStats } from "@/lib/stats";
import HomePageClient from "@/components/HomePageClient";

/** Regenerate HTML with fresh incidents periodically; client keeps map live */
export const revalidate = 120;

export default async function HomePage() {
  const incidents = await getAllIncidents();
  const initialStats = computeHeaderStats(incidents);

  return (
    <HomePageClient
      initialIncidents={incidents}
      initialStats={initialStats}
    />
  );
}
