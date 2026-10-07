import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Upload, Trash2, Plus, ImageIcon } from "lucide-react";
import { useStore, fileToDataUrl, type Brand } from "@/lib/store";
import { Btn, Card, PageHeader, inputCls } from "@/components/ui-kit";
import { PulseWaves } from "@/components/Panther";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "Brands & Image Check — Vibranium RiskGuard" },
      { name: "description", content: "Add your official brand details and compare suspect product photos with your originals." },
      { property: "og:title", content: "Brands & Image Check — Vibranium RiskGuard" },
      { property: "og:description", content: "Add your official brand details and compare suspect product photos with your originals." },
    ],
  }),
  component: BrandsPage,
});

function DropZone({ value, onFile, label }: { value?: string; onFile: (url: string) => void; label: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const handle = async (f?: File) => { if (f && f.type.startsWith("image/")) onFile(await fileToDataUrl(f)); };
  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files[0]); }}
      className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed transition-all ${over ? "border-magenta bg-wine/40 glow" : "border-border hover:border-magenta"}`}
    >
      {value ? <img src={value} alt={label} className="h-full w-full object-contain" /> : (
        <>
          <Upload className="h-8 w-8 text-magenta" />
          <span className="font-semibold">{label}</span>
          <span className="text-sm text-muted-foreground">Drop or click to upload</span>
        </>
      )}
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => handle(e.target.files?.[0])} />
    </div>
  );
}

async function compareImages(a: string, b: string) {
  const load = (s: string) => new Promise<HTMLImageElement>((r) => { const i = new Image(); i.onload = () => r(i); i.src = s; });
  const [ia, ib] = await Promise.all([load(a), load(b)]);
  const N = 32;
  const px = (img: HTMLImageElement) => {
    const c = document.createElement("canvas"); c.width = N; c.height = N;
    const x = c.getContext("2d")!; x.drawImage(img, 0, 0, N, N);
    return x.getImageData(0, 0, N, N).data;
  };
  const da = px(ia), db = px(ib);
  let diff = 0;
  for (let i = 0; i < da.length; i += 4) diff += (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2])) / 765;
  return Math.round((1 - diff / (N * N)) * 100);
}

function BrandsPage() {
  const { brands, addBrand, updateBrand, removeBrand } = useStore();
  const [form, setForm] = useState({ name: "", category: "", aliases: "", handles: "", apps: "", domains: "", logo: "" });
  const [orig, setOrig] = useState<string>();
  const [suspect, setSuspect] = useState<string>();
  const [checking, setChecking] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const split = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
  const save = () => {
    if (!form.name.trim()) return;
    const b: Brand = {
      id: crypto.randomUUID(), name: form.name.trim(), category: form.category || "General",
      aliases: split(form.aliases), handles: split(form.handles), apps: split(form.apps), domains: split(form.domains),
      logo: form.logo || undefined, price: 100, suspectPrice: 45, trust: 4, homoglyph: 50 + Math.floor(Math.random() * 40),
      logoSim: 50 + Math.floor(Math.random() * 40), metaSim: 40 + Math.floor(Math.random() * 50), verified: true, clones: Math.floor(Math.random() * 40),
    };
    addBrand(b);
    setForm({ name: "", category: "", aliases: "", handles: "", apps: "", domains: "", logo: "" });
  };

  const runCompare = async () => {
    if (!orig || !suspect) return;
    setChecking(true); setScore(null);
    const [s] = await Promise.all([compareImages(orig, suspect), new Promise((r) => setTimeout(r, 1800))]);
    setScore(s); setChecking(false);
  };

  return (
    <div className="space-y-10">
      <PageHeader title="Brands & Image Check" subtitle="Tell us what's officially yours, then upload a suspicious product photo to see how closely it copies the original." />

      {/* Image compare */}
      <Card>
        <h2 className="mb-1 flex items-center gap-2 text-2xl font-bold"><ImageIcon className="text-magenta" /> Original vs. Suspect</h2>
        <p className="mb-6 text-muted-foreground">Put your genuine product on the left and the listing you found on the right.</p>
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
          <DropZone value={orig} onFile={(u) => { setOrig(u); setScore(null); }} label="Your original" />
          <div className="flex flex-col items-center gap-4">
            {checking ? <PulseWaves size={100} /> : score !== null ? (
              <div className="text-center">
                <div className="font-display text-5xl font-black text-blood">{score}%</div>
                <div className="text-muted-foreground">visual match</div>
                <div className="mt-2 font-semibold">
                  {score > 85 ? "⚠ Likely a direct copy" : score > 65 ? "Strong resemblance" : "Looks different"}
                </div>
              </div>
            ) : <span className="font-display text-3xl text-muted-foreground">VS</span>}
            <Btn onClick={runCompare} disabled={!orig || !suspect || checking}>Compare</Btn>
          </div>
          <DropZone value={suspect} onFile={(u) => { setSuspect(u); setScore(null); }} label="Suspect product" />
        </div>
      </Card>

      {/* Add brand */}
      <Card>
        <h2 className="mb-6 text-2xl font-bold">Add an official brand</h2>
        <div className="grid gap-6 md:grid-cols-[180px_1fr]">
          <DropZone value={form.logo} onFile={(u) => setForm({ ...form, logo: u })} label="Logo" />
          <div className="grid gap-4 sm:grid-cols-2">
            {([
              ["name", "Brand name", "Nike"], ["category", "Category", "Sportswear"],
              ["aliases", "Aliases (comma separated)", "Swoosh, Air Jordan"], ["handles", "Verified handles", "@nike, @nikestore"],
              ["apps", "App IDs", "com.nike.app"], ["domains", "Official domains & sellers", "nike.com"],
            ] as const).map(([k, l, ph]) => (
              <label key={k} className="space-y-1.5">
                <span className="text-sm font-semibold text-muted-foreground">{l}</span>
                <input className={inputCls} placeholder={ph} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
              </label>
            ))}
            <div className="sm:col-span-2"><Btn onClick={save}><Plus className="h-5 w-5" /> Save brand</Btn></div>
          </div>
        </div>
      </Card>

      <section className="grid gap-5 md:grid-cols-2">
        {brands.map((b) => (
          <Card key={b.id} className="lift">
            <div className="flex items-start gap-4">
              <label className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-border bg-void">
                {b.logo ? <img src={b.logo} alt={b.name} className="h-full w-full object-contain" /> : <span className="font-display text-2xl text-blood">{b.name[0]}</span>}
                <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) updateBrand(b.id, { logo: await fileToDataUrl(f) }); }} />
              </label>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">{b.name}</h3>
                  <button onClick={() => removeBrand(b.id)} className="rounded p-1 text-muted-foreground hover:text-destructive" aria-label="Remove"><Trash2 className="h-5 w-5" /></button>
                </div>
                <p className="text-muted-foreground">{b.category}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[...b.handles, ...b.domains].map((h) => <span key={h} className="rounded-full bg-wine/50 px-2.5 py-0.5 text-sm">{h}</span>)}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
