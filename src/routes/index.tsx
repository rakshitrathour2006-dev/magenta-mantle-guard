import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Radar, ShieldAlert, Copy, Activity } from "lucide-react";
import hero from "@/assets/panther-hero.jpg";
import { useStore, riskLevel } from "@/lib/store";
import { Btn, Card } from "@/components/ui-kit";
import { PantherEyes, PulseWaves, Ribbon, Claws, PantherMark } from "@/components/Panther";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vibranium RiskGuard — Brand Protection Dashboard" },
      { name: "description", content: "Watch for fake accounts, clone apps and look-alike names that target your brand." },
      { property: "og:title", content: "Vibranium RiskGuard — Brand Protection Dashboard" },
      { property: "og:description", content: "Watch for fake accounts, clone apps and look-alike names that target your brand." },
    ],
  }),
  component: Home,
});

function Home() {
  const { alerts, brands, addAlert } = useStore();
  const [scanning, setScanning] = useState(false);
  const [found, setFound] = useState<number | null>(null);
  const open = alerts.filter((a) => a.status !== "Resolved");
  const critical = alerts.filter((a) => a.risk >= 85).length;

  const scan = () => {
    setScanning(true); setFound(null);
    setTimeout(() => {
      const b = brands[Math.floor(Math.random() * brands.length)];
      addAlert({
        id: crypto.randomUUID(), brandId: b.id, handle: `@${b.name.toLowerCase()}_0fficial_help`,
        platform: "Twitter/X", category: "Fake Impersonation", risk: 70 + Math.floor(Math.random() * 29),
        status: "New", date: new Date().toISOString().slice(0, 10),
      });
      setScanning(false); setFound(1);
    }, 3200);
  };

  const stats = [
    { label: "Open threats", value: open.length, icon: ShieldAlert },
    { label: "Critical", value: critical, icon: Activity },
    { label: "Brands protected", value: brands.length, icon: PantherMarkIcon },
    { label: "Clones tracked", value: brands.reduce((s, b) => s + b.clones, 0), icon: Copy },
  ];

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border glow fadeup">
        <img src={hero} alt="Black panther with glowing eyes" width={1280} height={896} className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-r from-void via-void/80 to-transparent" />
        <Claws className="absolute right-6 top-6 h-24 w-24 opacity-70" />
        <div className="relative grid gap-8 p-8 md:grid-cols-2 md:p-12">
          <div className="space-y-5">
            <p className="font-display text-xs tracking-[0.4em] text-magenta">WAKANDA-GRADE PROTECTION</p>
            <h1 className="text-4xl font-black leading-tight md:text-5xl">
              The Panther <span className="text-blood">guards your brand</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              We hunt down fake accounts, copycat apps and counterfeit products — before your customers fall for them.
            </p>
            <div className="flex flex-wrap gap-3">
              <Btn onClick={scan} disabled={scanning}><Radar className="h-5 w-5" />{scanning ? "Hunting…" : "Start live scan"}</Btn>
              <Link to="/brands"><Btn variant="ghost">Compare product images</Btn></Link>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="floaty"><PantherEyes size={400} /></div>
          </div>
        </div>
      </section>

      {/* Scan state */}
      {(scanning || found) && (
        <Card className="fadeup flex flex-col items-center gap-4 text-center">
          {scanning ? (
            <>
              <PulseWaves />
              <Ribbon />
              <p className="text-lg">Sweeping social networks and app stores…</p>
            </>
          ) : (
            <p className="text-lg">Scan complete — <span className="font-bold text-magenta">{found} new threat</span> added to your <Link to="/threats" className="underline">threat feed</Link>.</p>
          )}
        </Card>
      )}

      {/* Stats */}
      <section className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Card key={s.label} className="lift fadeup" >
            <div style={{ animationDelay: `${i * 80}ms` }}>
              <s.icon className="mb-3 h-7 w-7 text-magenta" />
              <div className="font-display text-4xl font-bold">{s.value}</div>
              <div className="mt-1 text-muted-foreground">{s.label}</div>
            </div>
          </Card>
        ))}
      </section>

      {/* Latest */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Latest threats</h2>
          <Link to="/threats" className="text-magenta hover:underline">See all →</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {alerts.slice(0, 4).map((a) => {
            const r = riskLevel(a.risk);
            return (
              <Card key={a.id} className="lift flex items-center justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">{a.handle}</div>
                  <div className="text-muted-foreground">{a.platform} · {a.category}</div>
                </div>
                <span className={`rounded-full border px-3 py-1 text-sm font-bold ${r.cls}`}>{a.risk}% {r.label}</span>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function PantherMarkIcon({ className }: { className?: string }) {
  return <PantherMark className={className} />;
}
