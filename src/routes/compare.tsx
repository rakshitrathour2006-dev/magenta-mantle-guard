import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GitCompare } from "lucide-react";
import { PageHeader, Card, inputCls } from "@/components/ui-kit";
import { PantherMark } from "@/components/Panther";
import { useStore, riskLevel, type Brand } from "@/lib/store";

export const Route = createFileRoute("/compare")({
  head: () => ({ meta: [
    { title: "Brand Comparison — Vibranium RiskGuard" },
    { name: "description", content: "Compare risk scores, look-alike domains and takedown readiness between two brands." },
    { property: "og:title", content: "Brand Comparison — Vibranium RiskGuard" },
    { property: "og:description", content: "Compare risk scores, look-alike domains and takedown readiness between two brands." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Compare,
});

function metrics(b: Brand, alerts: { brandId: string; risk: number; category: string; platform: string; status: string }[], other?: Brand) {
  const mine = alerts.filter((a) => a.brandId === b.id);
  const risk = Math.min(100, Math.round((b.homoglyph + b.logoSim + b.metaSim) / 3 * 0.6 + Math.min(40, b.clones / 4)));
  const overlap = other ? Math.round(100 - Math.abs(b.metaSim - other.metaSim) - Math.abs(b.homoglyph - other.homoglyph) / 2) : 0;
  const seed = b.name.length * 7 + b.clones;
  return {
    risk,
    overlap: Math.max(0, Math.min(100, overlap)),
    domainFreq: Math.min(100, Math.round(b.homoglyph * 0.8 + mine.length * 5)),
    keyword: Math.min(100, Math.round(b.metaSim * 0.9 + (b.aliases.length * 4))),
    ssl: b.verified ? "Valid (EV)" : "Expiring soon",
    age: `${3 + (seed % 22)} years`,
    kits: Math.round(b.clones / 9) + mine.filter((a) => a.category === "Malware / Fake App").length,
    social: mine.filter((a) => ["Twitter/X", "Instagram", "LinkedIn"].includes(a.platform)).length + Math.round(b.clones / 6),
    ready: Math.min(100, 40 + b.domains.length * 15 + b.handles.length * 8 + (b.verified ? 15 : 0)),
  };
}

function Bar({ label, v }: { label: string; v: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm"><span className="text-muted-foreground">{label}</span><span className="font-bold">{v}%</span></div>
      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-void"><div className="h-full bg-blood glow transition-all duration-700" style={{ width: `${v}%` }} /></div>
    </div>
  );
}

function Gauge({ v }: { v: number }) {
  const r = riskLevel(v); const C = 2 * Math.PI * 52;
  return (
    <div className="relative mx-auto h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--muted)" strokeWidth="10" />
        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--magenta)" strokeWidth="10" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - v / 100)} style={{ filter: "drop-shadow(0 0 8px var(--magenta))", transition: "stroke-dashoffset .8s" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold">{v}%</span>
        <span className={`mt-1 rounded-full border px-2 text-xs font-bold ${r.cls}`}>{r.label === "Safe" ? "Low" : r.label}</span>
      </div>
    </div>
  );
}

function Compare() {
  const { brands, alerts } = useStore();
  const [a, setA] = useState(""); const [b, setB] = useState("");
  const A = brands.find((x) => x.id === a); const B = brands.find((x) => x.id === b);
  const ready = A && B && A.id !== B.id;
  const mA = ready ? metrics(A, alerts, B) : null; const mB = ready ? metrics(B, alerts, A) : null;

  return (
    <div className="space-y-6">
      <PageHeader title="Brand Comparison" subtitle="Pick two brands to see which one is under heavier attack and which is better prepared to fight back." />
      <Card className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
        {[{ l: "Target A", v: a, s: setA }, null, { l: "Target B", v: b, s: setB }].map((x, i) => x ? (
          <label key={x.l} className="block"><span className="mb-1 block text-sm font-semibold uppercase tracking-widest text-muted-foreground">{x.l}</span>
            <select className={`${inputCls} glow`} value={x.v} onChange={(e) => x.s(e.target.value)}>
              <option value="">Choose a brand…</option>{brands.map((br) => <option key={br.id} value={br.id}>{br.name}</option>)}
            </select></label>
        ) : <GitCompare key={i} className="mx-auto mb-2 h-8 w-8 text-magenta" />)}
      </Card>

      {!ready || !mA || !mB ? (
        <Card className="flex flex-col items-center gap-4 py-14 text-center">
          <PantherMark className="h-16 w-16" />
          <h3 className="text-xl font-bold">Choose two different brands</h3>
          <p className="max-w-md text-muted-foreground">The panther needs two targets to stalk. Select Target A and Target B above to see them side by side.</p>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {[{ br: A, m: mA }, { br: B, m: mB }].map(({ br, m }) => (
              <Card key={br.id} className="lift space-y-4 fadeup">
                <h3 className="text-center text-xl font-bold text-blood">{br.name}</h3>
                <Gauge v={m.risk} />
                <Bar label="Threat Overlap" v={m.overlap} />
                <Bar label="Look-alike Domain Frequency" v={m.domainFreq} />
                <Bar label="Keyword Co-occurrence" v={m.keyword} />
              </Card>
            ))}
          </div>
          <Card className="overflow-x-auto !p-0">
            <table className="w-full text-left">
              <thead><tr className="border-b border-border"><th className="p-4 text-muted-foreground">Check</th><th className="p-4 text-blood">{A.name}</th><th className="p-4 text-blood">{B.name}</th></tr></thead>
              <tbody>
                {([["SSL Certificate Status", "ssl"], ["Domain Age", "age"], ["Active Phishing Kits Found", "kits"], ["Social Impersonation Count", "social"], ["Takedown Readiness", "ready"]] as const).map(([l, k]) => (
                  <tr key={k} className="border-b border-border/50 transition hover:bg-wine/30">
                    <td className="p-4 font-semibold">{l}</td>
                    <td className="p-4">{mA[k]}{k === "ready" && "%"}</td>
                    <td className="p-4">{mB[k]}{k === "ready" && "%"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
