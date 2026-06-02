import { notFound } from "next/navigation";
import IncidentDetail from "@/components/IncidentDetail";
import PageHeader from "@/components/PageHeader";
import { getIncidentById } from "@/lib/get-incident";

export default async function IncidentPage({
  params,
}: {
  params: { id: string };
}) {
  const incident = await getIncidentById(params.id);
  if (!incident) notFound();

  return (
    <div className="page-shell">
      <PageHeader
        backLabel="← Back to map"
        badge="FULL DOSSIER — CLASSIFIED"
      />
      <main className="page-content-narrow flex-1 max-w-dossier">
        <IncidentDetail incident={incident} />
      </main>
    </div>
  );
}
