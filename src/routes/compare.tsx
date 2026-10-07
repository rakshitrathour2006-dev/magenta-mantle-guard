import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/ui-kit";
import { WaveBars } from "@/components/Panther";

export const Route = createFileRoute("/compare")({
  head: () => ({ meta: [
    { title: "Brand Comparison — Vibranium RiskGuard" },
    { name: "description", content: "Brand Comparison for your protected brands." },
    { property: "og:title", content: "Brand Comparison — Vibranium RiskGuard" },
    { property: "og:description", content: "Brand Comparison for your protected brands." },
  ] }),
  component: Compare,
});

function Compare() {
  return (
    <div>
      <PageHeader title="Brand Comparison" subtitle="This section is coming next." />
      <Card className="flex flex-col items-center gap-4 text-center"><WaveBars /><p className="text-muted-foreground">Under construction.</p></Card>
    </div>
  );
}
