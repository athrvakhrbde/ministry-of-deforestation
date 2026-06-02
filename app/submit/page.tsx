import dynamic from "next/dynamic";
import PageHeader from "@/components/PageHeader";

const SubmitForm = dynamic(() => import("@/components/SubmitForm"), {
  loading: () => (
    <p className="font-data text-sm text-muted animate-pulse py-8">Loading form...</p>
  ),
});

export default function SubmitPage() {
  return (
    <div className="page-shell">
      <PageHeader
        backLabel="← Back to map"
        title="FILE A REPORT"
        subtitle="Your submission will be reviewed before appearing on the map."
      />
      <main className="page-content-narrow flex-1">
        <SubmitForm />
      </main>
    </div>
  );
}
