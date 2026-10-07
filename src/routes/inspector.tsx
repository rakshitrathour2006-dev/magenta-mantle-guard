import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useStore, analyze, SENS } from "@/lib/store";
import { Btn, Card, PageHeader, inputCls } from "@/components/ui-kit";

export const Route = createFileRoute("/inspector")({
  head: () => ({
    meta: [
      { title: "Look-alike Name Inspector — Vibranium RiskGuard" },
      { name: "description", content: "Type any name and instantly see if it's a sneaky copy of your brand." },
      { property: "og:title", content: "Look-alike Name Inspector — Vibranium RiskGuard" },
      { property: "og:description", content: "Type any name and instantly see if it's a sneaky copy of your brand." },
    ],
  }),
  component: Inspector,
});

const examples = ["PayPaI", "Nike-Support-Free", "N i k e", "Аpple", "b1nance_official"];

function Inspector() {
  const { brands, settings, setSettings, pushHistory, addAlert } = useStore();
  const [brandId, setBrandId] = useState(brands[0]?.id);
  const [text, setText] = useState("PayPaI");
  const brand = brands.find((b) => b.id === brandId) ?? brands[0];
  const res = brand ? analyze(text, brand.name, settings.sensitivity) : null;

  return (
    <div className="space-y-8">
      <PageHeader title="Look-alike Inspector" subtitle="Type any account, app or website name. We'll tell you if it's trying to look like your brand." />

      <Card>
        <h2 className="mb-4 text-xl font-bold">1. How picky should we be?</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {SENS.map((s, i) => (
            <button key={s} onClick={() => setSettings({ sensitivity: i })}
              className={`rounded-xl border-2 p-4 text-left transition-all active:scale-95 ${settings.sensitivity === i ? "border-magenta bg-wine/50 glow" : "border-border hover:border-magenta/60 hover:-translate-y-1"}`}>
              <div className="font-display text-2xl font-bold text-blood">{i + 1}</div>
              <div className="font-semibold">{s}</div>
            </button>
          ))}
        </div>
        <input type="range" min={0} max={3} value={settings.sensitivity} onChange={(e) => setSettings({ sensitivity: +e.target.value })} className="mt-5 w-full accent-[var(--magenta)]" />
      </Card>

      <Card>
        <h2 className="mb-4 text-xl font-bold">2. Test a name</h2>
        <div className="grid gap-4 md:grid-cols-[200px_1fr]">
          <select className={inputCls} value={brandId} onChange={(e) => setBrandId(e.target.value)}>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <input className={`${inputCls} text-xl`} value={text} onChange={(e) => setText(e.target.value)} onBlur={() => text && pushHistory(text)} placeholder="Type a suspicious name…" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-muted-foreground">Try:</span>
          {examples.map((e) => <button key={e} onClick={() => setText(e)} className="rounded-full border border-border px-3 py-0.5 text-sm hover:border-magenta">{e}</button>)}
        </div>

        {res && brand && (
          <div className={`mt-6 rounded-xl border-2 p-6 fadeup ${res.flagged ? "border-destructive bg-destructive/10" : "border-safe/60 bg-safe/5"}`}>
            <div className="flex flex-wrap items-center gap-6">
              <div className="relative h-28 w-28">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--muted)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke={res.flagged ? "var(--destructive)" : "var(--safe)"} strokeWidth="3" strokeDasharray={`${res.score} 100`} strokeLinecap="round" style={{ transition: "stroke-dasharray .4s" }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-display text-2xl font-bold">{res.score}%</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-2xl font-bold">
                  {res.flagged ? <><AlertTriangle className="text-destructive" /> Looks like a fake {brand.name}</> : <><CheckCircle2 className="text-safe" /> Not flagged</>}
                </div>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  {res.reasons.length ? res.reasons.map((r) => <li key={r}>• {r}</li>) : <li>No tricks detected.</li>}
                </ul>
              </div>
              {res.flagged && (
                <Btn variant="danger" onClick={() => addAlert({ id: crypto.randomUUID(), brandId: brand.id, handle: text, platform: "Twitter/X", category: "Fake Impersonation", risk: res.score, status: "New", date: new Date().toISOString().slice(0, 10) })}>
                  Add to threats
                </Btn>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
