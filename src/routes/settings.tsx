import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Gauge, Sparkles, Clock, Database, Trash2 } from "lucide-react";
import { PageHeader, Card, Btn, Modal, inputCls } from "@/components/ui-kit";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [
    { title: "Settings — Vibranium RiskGuard" },
    { name: "description", content: "Alerts, scan sensitivity, visual effects, auto-scan schedule and local data controls." },
    { property: "og:title", content: "Settings — Vibranium RiskGuard" },
    { property: "og:description", content: "Alerts, scan sensitivity, visual effects, auto-scan schedule and local data controls." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Settings,
});

const LEVELS = ["Strict", "Moderate", "High", "Ultra"];
const SCHED = ["Disabled (Manual)", "1h", "6h", "24h"];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)}
      className={`relative h-8 w-16 shrink-0 rounded-full border transition-all duration-200 ${on ? "border-magenta bg-blood glow" : "border-border bg-void"}`}>
      <span className={`absolute top-1 h-5.5 w-5.5 rounded-full bg-foreground transition-all duration-200 ${on ? "left-9" : "left-1"}`} style={{ height: 22, width: 22 }} />
    </button>
  );
}

function Row({ icon: I, title, desc, children }: { icon: typeof Bell; title: string; desc: string; children: React.ReactNode }) {
  return (
    <Card className="lift flex flex-wrap items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-wine/60"><I className="h-6 w-6 text-magenta" /></div>
      <div className="min-w-[200px] flex-1"><h3 className="text-lg font-bold">{title}</h3><p className="text-muted-foreground">{desc}</p></div>
      {children}
    </Card>
  );
}

function Settings() {
  const { settings, setSettings, resetAll } = useStore();
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const toggleAlerts = async (v: boolean) => {
    if (v && typeof Notification !== "undefined" && Notification.permission === "default") await Notification.requestPermission();
    setSettings({ push: v });
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Settings" subtitle="Tune how the panther hunts and how it tells you about what it finds." />
      <Row icon={Bell} title="Real-time Threat Alerts" desc="Show a browser alert when a critical threat is logged.">
        <Toggle on={settings.push} onChange={toggleAlerts} />
      </Row>
      <Card className="lift space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-wine/60"><Gauge className="h-6 w-6 text-magenta" /></div>
          <div><h3 className="text-lg font-bold">Scan Sensitivity Level</h3><p className="text-muted-foreground">How closely a name must match before we flag it.</p></div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {LEVELS.map((l, i) => (
            <button key={l} onClick={() => setSettings({ sensitivity: i })}
              className={`rounded-lg border px-3 py-2 font-semibold transition ${settings.sensitivity === i ? "border-magenta bg-blood text-primary-foreground glow" : "border-border bg-muted hover:border-magenta"}`}>{l}</button>
          ))}
        </div>
        <input type="range" min={0} max={3} value={settings.sensitivity} onChange={(e) => setSettings({ sensitivity: +e.target.value })} className="w-full accent-[var(--magenta)]" />
      </Card>
      <Row icon={Sparkles} title="Panther Visual FX" desc="Cheetah spots and animated panther eyes. Turn off for better speed.">
        <Toggle on={settings.fx !== false} onChange={(v) => setSettings({ fx: v })} />
      </Row>
      <Row icon={Clock} title="Auto-Scan Schedule" desc="How often to re-check your brands automatically.">
        <select className={`${inputCls} !w-52`} value={settings.schedule ?? SCHED[0]} onChange={(e) => setSettings({ schedule: e.target.value })}>
          {SCHED.map((s) => <option key={s}>{s}</option>)}
        </select>
      </Row>
      <Row icon={Database} title="Storage & Data Management" desc={done ? "All data reset to the starting examples." : "Everything is saved only in this browser."}>
        <button onClick={() => setConfirm(true)} className="inline-flex items-center gap-2 rounded-lg border-2 border-magenta px-5 py-2.5 font-semibold text-magenta transition hover:bg-magenta/15 hover:shadow-[var(--glow)] active:scale-95">
          <Trash2 className="h-5 w-5" /> Reset Local Data
        </button>
      </Row>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="Reset all local data?">
        <p className="text-muted-foreground">This deletes your brands, threats, photos and settings from this browser and restores the starting examples. This can't be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Btn variant="ghost" onClick={() => setConfirm(false)}>Cancel</Btn>
          <Btn variant="danger" onClick={() => { resetAll(); setConfirm(false); setDone(true); }}><Trash2 className="h-5 w-5" /> Yes, reset</Btn>
        </div>
      </Modal>
    </div>
  );
}
