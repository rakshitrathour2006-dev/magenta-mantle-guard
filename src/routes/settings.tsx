import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/ui-kit";
import { WaveBars } from "@/components/Panther";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [
    { title: "Settings — Vibranium RiskGuard" },
    { name: "description", content: "Settings for your protected brands." },
    { property: "og:title", content: "Settings — Vibranium RiskGuard" },
    { property: "og:description", content: "Settings for your protected brands." },
  ] }),
  component: Settings,
});

function Settings() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="This section is coming next." />
      <Card className="flex flex-col items-center gap-4 text-center"><WaveBars /><p className="text-muted-foreground">Under construction.</p></Card>
    </div>
  );
}
