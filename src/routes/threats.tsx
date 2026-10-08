import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Gavel, Plus, Search } from "lucide-react";
import { useStore, riskLevel, fileToDataUrl, type Alert, type Platform, type Category, type Status } from "@/lib/store";
import { Btn, Card, Modal, PageHeader, inputCls } from "@/components/ui-kit";

export const Route = createFileRoute("/threats")({
  head: () => ({
    meta: [
      { title: "Threat Feed — Vibranium RiskGuard" },
      { name: "description", content: "Fake accounts, scam pages and clone apps found across social media and app stores." },
      { property: "og:title", content: "Threat Feed — Vibranium RiskGuard" },
      { property: "og:description", content: "Fake accounts, scam pages and clone apps found across social media and app stores." },
    ],
  }),
  component: Threats,
});

const PLATFORMS: Platform[] = ["Twitter/X", "Instagram", "LinkedIn", "Google Play", "iOS App Store"];
const CATS: Category[] = ["Fake Impersonation", "Fraudulent Brand Page", "Scam Profile", "Malware / Fake App"];
const STATUSES: Status[] = ["New", "Under Investigation", "Takedown Requested", "Resolved"];

function Threats() {
  const { alerts, brands, setStatus, addAlert, updateAlert } = useStore();
  const [q, setQ] = useState("");
  const [plat, setPlat] = useState("All");
  const [minRisk, setMinRisk] = useState(0);
  const [stat, setStat] = useState("All");
  const [detail, setDetail] = useState<Alert | null>(null);
  const [takedown, setTakedown] = useState<Alert | null>(null);
  const [adding, setAdding] = useState(false);

  const list = alerts.filter((a) =>
    a.handle.toLowerCase().includes(q.toLowerCase()) && (plat === "All" || a.platform === plat) && a.risk >= minRisk && (stat === "All" || a.status === stat));
  const brandOf = (id: string) => brands.find((b) => b.id === id);
  const next = (s: Status): Status => STATUSES[(STATUSES.indexOf(s) + 1) % STATUSES.length];

  return (
    <div className="space-y-6">
      <PageHeader title="Threat Feed" subtitle="Everything suspicious we've found. Click a row to see details, or send a takedown notice in one click." />

      <Card className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto]">
        <div className="relative"><Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" /><input className={`${inputCls} pl-10`} placeholder="Search handle…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select className={inputCls} value={plat} onChange={(e) => setPlat(e.target.value)}><option>All</option>{PLATFORMS.map((p) => <option key={p}>{p}</option>)}</select>
        <select className={inputCls} value={stat} onChange={(e) => setStat(e.target.value)}><option>All</option>{STATUSES.map((p) => <option key={p}>{p}</option>)}</select>
        <select className={inputCls} value={minRisk} onChange={(e) => setMinRisk(+e.target.value)}>
          <option value={0}>Any risk</option><option value={40}>Medium+</option><option value={65}>High+</option><option value={85}>Critical</option>
        </select>
        <Btn onClick={() => setAdding(true)}><Plus className="h-5 w-5" /> Report</Btn>
      </Card>

      <div className="space-y-3">
        {list.length === 0 && <Card className="text-center text-muted-foreground">No threats match those filters.</Card>}
        {list.map((a) => {
          const r = riskLevel(a.risk); const b = brandOf(a.brandId);
          return (
            <Card key={a.id} className="lift cursor-pointer !p-4">
              <div className="flex flex-wrap items-center gap-4" onClick={() => setDetail(a)}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-wine/50 font-display font-bold">
                  {a.image ? <img src={a.image} alt="" className="h-full w-full object-cover" /> : a.platform[0]}
                </div>
                <div className="min-w-[180px] flex-1">
                  <div className="text-lg font-semibold">{a.handle}</div>
                  <div className="text-muted-foreground">{a.platform} · {a.category} · targets {b?.name ?? "—"}</div>
                </div>
                <span className={`rounded-full border px-3 py-1 text-sm font-bold ${r.cls}`}>{a.risk}% {r.label}</span>
                <button onClick={(e) => { e.stopPropagation(); setStatus(a.id, next(a.status)); }}
                  className="rounded-full border border-border bg-muted px-3 py-1 text-sm transition hover:border-magenta hover:shadow-[var(--glow)]" title="Click to advance status">
                  {a.status}
                </button>
                <Btn variant="danger" className="!px-3 !py-1.5" onClick={(e) => { e.stopPropagation(); setTakedown(a); }}><Gavel className="h-4 w-4" /> Takedown</Btn>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Side-by-side view">
        {detail && (
          <div className="grid grid-cols-2 gap-4">
            {[{ t: "Official", img: brandOf(detail.brandId)?.logo, name: brandOf(detail.brandId)?.name }, { t: "Suspect", img: detail.image, name: detail.handle }].map((x) => (
              <div key={x.t} className="space-y-2 text-center">
                <div className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">{x.t}</div>
                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border bg-void">
                  {x.img ? <img src={x.img} alt="" className="h-full w-full object-contain" /> : <span className="font-display text-5xl text-blood">{x.name?.[0]}</span>}
                </div>
                <div className="font-semibold">{x.name}</div>
              </div>
            ))}
            {detail.image && (
              <div className="col-span-2 flex items-center justify-center gap-3">
                <img src={detail.image} alt="Saved suspect" className="h-16 w-16 rounded-lg border-2 border-magenta object-cover glow" />
                <span className="text-sm text-safe">Saved suspect photo</span>
              </div>
            )}
            <label className="col-span-2 cursor-pointer text-center text-magenta underline">
              Upload suspect image
              <input type="file" accept="image/*" hidden onChange={async (e) => {
                const f = e.target.files?.[0]; if (!f) return;
                const img = await fileToDataUrl(f);
                updateAlert(detail.id, { image: img }); setDetail({ ...detail, image: img });
              }} />
            </label>
          </div>
        )}
      </Modal>

      <TakedownModal alert={takedown} brandName={takedown ? brandOf(takedown.brandId)?.name ?? "" : ""} onClose={() => setTakedown(null)} onSent={(id) => setStatus(id, "Takedown Requested")} />
      <AddModal open={adding} onClose={() => setAdding(false)} onAdd={(a) => { addAlert(a); setAdding(false); }} />
    </div>
  );
}


function TakedownModal({ alert, brandName, onClose, onSent }: { alert: Alert | null; brandName: string; onClose: () => void; onSent: (id: string) => void }) {
  if (!alert) return null;
  const notice = `TAKEDOWN / DMCA NOTICE
Date: ${new Date().toDateString()}
To: ${alert.platform} Trust & Safety Team

I am writing on behalf of ${brandName}, the owner of the trademarks and copyrighted material described below.

Infringing account / app: ${alert.handle}
Platform: ${alert.platform}
Violation type: ${alert.category}
Calculated risk score: ${alert.risk}%

This account impersonates ${brandName} and misleads consumers. I have a good-faith belief that this use is not authorized by the owner, its agent, or the law. The information in this notice is accurate, and under penalty of perjury, I am authorized to act on behalf of the owner.

Please remove or disable access to the material above.

Signed,
${brandName} Brand Protection — via Vibranium RiskGuard`;
  const download = () => {
    const url = URL.createObjectURL(new Blob([notice], { type: "text/plain" }));
    const a = document.createElement("a"); a.href = url; a.download = `takedown-${alert.handle.replace(/\W+/g, "_")}.txt`; a.click();
    URL.revokeObjectURL(url); onSent(alert.id); onClose();
  };
  return (
    <Modal open onClose={onClose} title="Takedown notice">
      <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-void p-4 text-sm">{notice}</pre>
      <div className="mt-4 flex justify-end gap-3"><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={download}><Download className="h-5 w-5" /> Download & mark sent</Btn></div>
    </Modal>
  );
}

function AddModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (a: Alert) => void }) {
  const { brands } = useStore();
  const [f, setF] = useState({ handle: "", brandId: brands[0]?.id ?? "", platform: PLATFORMS[0], category: CATS[0], risk: 70, image: "" });
  return (
    <Modal open={open} onClose={onClose} title="Report a suspicious account">
      <div className="grid gap-3">
        <input className={inputCls} placeholder="Handle or app name" value={f.handle} onChange={(e) => setF({ ...f, handle: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <select className={inputCls} value={f.brandId} onChange={(e) => setF({ ...f, brandId: e.target.value })}>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
          <select className={inputCls} value={f.platform} onChange={(e) => setF({ ...f, platform: e.target.value as Platform })}>{PLATFORMS.map((p) => <option key={p}>{p}</option>)}</select>
          <select className={inputCls} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as Category })}>{CATS.map((p) => <option key={p}>{p}</option>)}</select>
          <label className="flex items-center gap-2">Risk {f.risk}%<input type="range" min={0} max={100} value={f.risk} onChange={(e) => setF({ ...f, risk: +e.target.value })} className="flex-1 accent-[var(--magenta)]" /></label>
        </div>
        <input type="file" accept="image/*" onChange={async (e) => { const x = e.target.files?.[0]; if (x) setF({ ...f, image: await fileToDataUrl(x) }); }} />
        <Btn onClick={() => f.handle && onAdd({ id: crypto.randomUUID(), handle: f.handle, brandId: f.brandId, platform: f.platform, category: f.category, risk: f.risk, image: f.image || undefined, status: "New", date: new Date().toISOString().slice(0, 10) })}>Add threat</Btn>
      </div>
    </Modal>
  );
}
