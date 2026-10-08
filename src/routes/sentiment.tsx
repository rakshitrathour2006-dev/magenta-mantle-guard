import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Twitter, Send, Skull, Globe } from "lucide-react";
import { PageHeader, Card, inputCls } from "@/components/ui-kit";

export const Route = createFileRoute("/sentiment")({
  head: () => ({ meta: [
    { title: "What People Are Saying — Vibranium RiskGuard" },
    { name: "description", content: "Net sentiment, trend over time and a live stream of web and social mentions about your brands." },
    { property: "og:title", content: "What People Are Saying — Vibranium RiskGuard" },
    { property: "og:description", content: "Net sentiment, trend over time and a live stream of web and social mentions about your brands." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Sentiment,
});

type Src = "Twitter/X" | "Telegram" | "Dark Web" | "Web Search";
type Sent = "Positive" | "Neutral" | "Negative";
const ICON = { "Twitter/X": Twitter, Telegram: Send, "Dark Web": Skull, "Web Search": Globe };
const MENTIONS: { src: Src; time: string; text: string; sent: Sent; tags: string[] }[] = [
  { src: "Twitter/X", time: "2 min ago", text: "Just got my Nike order, delivery was super quick. Love it!", sent: "Positive", tags: [] },
  { src: "Telegram", time: "9 min ago", text: "🔥 Binance airdrop — send 0.1 BNB to claim 2 BNB back, admin verified", sent: "Negative", tags: ["Phishing"] },
  { src: "Dark Web", time: "24 min ago", text: "Selling PayPal login kit v4, bypasses 2FA prompts, includes hosting", sent: "Negative", tags: ["Phishing"] },
  { src: "Web Search", time: "41 min ago", text: "Apple releases new iOS security update for all devices", sent: "Neutral", tags: [] },
  { src: "Twitter/X", time: "1 h ago", text: "@nike_supp0rt_help asked me for my card details to process a refund?? Is this real?", sent: "Negative", tags: ["Impersonation"] },
  { src: "Telegram", time: "2 h ago", text: "Official Apple Rewards group — DM for free AirPods (limited)", sent: "Negative", tags: ["Impersonation", "Phishing"] },
  { src: "Web Search", time: "3 h ago", text: "PayPal customer service response time improved, survey says", sent: "Positive", tags: [] },
  { src: "Twitter/X", time: "5 h ago", text: "Anyone else find the new Binance app layout confusing?", sent: "Neutral", tags: [] },
];
const SENT_CLS: Record<Sent, string> = {
  Positive: "bg-safe/20 text-safe border-safe",
  Neutral: "bg-wine/40 text-foreground border-wine",
  Negative: "bg-destructive/20 text-destructive border-destructive",
};
const TREND = [42, 55, 38, 61, 70, 48, 83, 66, 52, 74, 90, 68, 58, 77];

function Sentiment() {
  const [q, setQ] = useState(""); const [tag, setTag] = useState("All"); const [hover, setHover] = useState<number | null>(null);
  const pos = 34, neu = 28, neg = 38; const net = pos - neg + 50;
  const C = 2 * Math.PI * 70;
  const list = MENTIONS.filter((m) => m.text.toLowerCase().includes(q.toLowerCase()) &&
    (tag === "All" || (tag === "Negative" ? m.sent === "Negative" : m.tags.includes(tag))));
  const W = 600, H = 160, step = W / (TREND.length - 1);
  const pts = TREND.map((v, i) => [i * step, H - (v / 100) * (H - 20) - 10]);
  const path = pts.map((p, i) => (i ? `L${p[0]},${p[1]}` : `M${p[0]},${p[1]}`)).join(" ");

  return (
    <div className="space-y-6">
      <PageHeader title="What People Are Saying" subtitle="How the internet feels about your brands right now — and where the scammers are talking." />
      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <Card className="flex flex-col items-center justify-center gap-2">
          <div className="relative h-48 w-48">
            <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90 panther-eyes">
              <circle cx="80" cy="80" r="70" fill="none" stroke="var(--muted)" strokeWidth="12" />
              <circle cx="80" cy="80" r="70" fill="none" stroke="url(#sg)" strokeWidth="12" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - net / 100)} />
              <defs><linearGradient id="sg"><stop offset="0" stopColor="var(--primary)" /><stop offset="1" stopColor="var(--magenta)" /></linearGradient></defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="font-display text-4xl font-bold">{net}</span><span className="text-sm text-muted-foreground">Net Sentiment</span></div>
          </div>
        </Card>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { l: "Positive", v: pos, s: "0 0 22px oklch(0.72 0.15 150 / .5), 0 0 30px oklch(0.62 0.27 350 / .3)", c: "text-safe" },
            { l: "Neutral", v: neu, s: "0 0 24px oklch(0.32 0.12 10 / .8)", c: "text-foreground" },
            { l: "Negative / Hostile", v: neg, s: "0 0 26px oklch(0.6 0.26 25 / .7)", c: "text-destructive" },
          ].map((t) => (
            <div key={t.l} className="glass lift flex flex-col items-center justify-center p-6 text-center" style={{ boxShadow: t.s }}>
              <span className={`font-display text-4xl font-bold ${t.c}`}>{t.v}%</span>
              <span className="mt-2 text-muted-foreground">{t.l}</span>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <h3 className="mb-3 text-lg font-bold">Mention volume — last 14 days</h3>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" onMouseLeave={() => setHover(null)}>
          <path d={`${path} L${W},${H} L0,${H} Z`} fill="var(--magenta)" opacity=".12" />
          <path d={path} fill="none" stroke="var(--magenta)" strokeWidth="3" className="ribbon" style={{ filter: "drop-shadow(0 0 6px var(--magenta))", strokeDasharray: "none" }} />
          {pts.map((p, i) => (
            <g key={i} onMouseEnter={() => setHover(i)} className="cursor-pointer">
              <rect x={p[0] - step / 2} y={0} width={step} height={H} fill="transparent" />
              <circle cx={p[0]} cy={p[1]} r={hover === i ? 7 : 4} fill="var(--primary)" stroke="var(--magenta)" strokeWidth="2" />
              {hover === i && <text x={Math.min(W - 60, Math.max(10, p[0] - 30))} y={Math.max(14, p[1] - 12)} fill="var(--foreground)" fontSize="13">Day {i + 1}: {TREND[i] * 12}</text>}
            </g>
          ))}
        </svg>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" /><input className={`${inputCls} pl-10`} placeholder="Search mentions…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          {["All", "Negative", "Phishing", "Impersonation"].map((t) => (
            <button key={t} onClick={() => setTag(t)} className={`rounded-full border px-4 py-1.5 transition ${tag === t ? "border-magenta bg-blood text-primary-foreground glow" : "border-border bg-muted hover:border-magenta"}`}>{t}</button>
          ))}
        </div>
        <div className="space-y-3">
          {list.length === 0 && <p className="text-center text-muted-foreground">No mentions match.</p>}
          {list.map((m, i) => { const I = ICON[m.src]; return (
            <div key={i} className="glass lift flex items-start gap-4 !rounded-lg p-4 fadeup">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-wine/60"><I className="h-5 w-5 text-magenta" /></div>
              <div className="flex-1"><div className="text-sm text-muted-foreground">{m.src} · {m.time}</div><p className="mt-1">{m.text}</p></div>
              <span className={`rounded-full border px-3 py-1 text-sm font-bold ${SENT_CLS[m.sent]}`}>{m.sent}</span>
            </div>
          ); })}
        </div>
      </Card>
    </div>
  );
}
