import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/ui-kit";
import { WaveBars } from "@/components/Panther";

export const Route = createFileRoute("/sentiment")({
  head: () => ({ meta: [
    { title: "What People Are Saying — Vibranium RiskGuard" },
    { name: "description", content: "What People Are Saying for your protected brands." },
    { property: "og:title", content: "What People Are Saying — Vibranium RiskGuard" },
    { property: "og:description", content: "What People Are Saying for your protected brands." },
  ] }),
  component: Sentiment,
});

function Sentiment() {
  return (
    <div>
      <PageHeader title="What People Are Saying" subtitle="This section is coming next." />
      <Card className="flex flex-col items-center gap-4 text-center"><WaveBars /><p className="text-muted-foreground">Under construction.</p></Card>
    </div>
  );
}
