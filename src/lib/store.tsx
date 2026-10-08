import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Platform = "Twitter/X" | "Instagram" | "LinkedIn" | "Google Play" | "iOS App Store";
export type Category = "Fake Impersonation" | "Fraudulent Brand Page" | "Scam Profile" | "Malware / Fake App";
export type Status = "New" | "Under Investigation" | "Takedown Requested" | "Resolved";

export interface Brand {
  id: string;
  name: string;
  category: string;
  aliases: string[];
  handles: string[];
  apps: string[];
  domains: string[];
  logo?: string;
  price: number;
  suspectPrice: number;
  trust: number;
  homoglyph: number;
  logoSim: number;
  metaSim: number;
  verified: boolean;
  clones: number;
}
export interface Alert {
  id: string;
  brandId: string;
  handle: string;
  platform: Platform;
  category: Category;
  risk: number;
  status: Status;
  image?: string;
  date: string;
}
export interface Settings {
  email: boolean;
  push: boolean;
  weekly: boolean;
  apiKey: string;
  sensitivity: number;
  fx?: boolean;
  schedule?: string;
}

const seedBrands: Brand[] = [
  { id: "nike", name: "Nike", category: "Sportswear", aliases: ["Swoosh", "Air Jordan"], handles: ["@nike", "@nikestore", "@nike_support"], apps: ["com.nike.omega"], domains: ["nike.com"], price: 120, suspectPrice: 38, trust: 4.5, homoglyph: 72, logoSim: 81, metaSim: 64, verified: true, clones: 48 },
  { id: "paypal", name: "PayPal", category: "Fintech", aliases: ["PP"], handles: ["@PayPal", "@AskPayPal"], apps: ["com.paypal.android.p2pmobile"], domains: ["paypal.com"], price: 0, suspectPrice: 0, trust: 4.1, homoglyph: 91, logoSim: 77, metaSim: 83, verified: true, clones: 112 },
  { id: "apple", name: "Apple", category: "Electronics", aliases: ["iPhone", "AirPods"], handles: ["@Apple", "@AppleSupport"], apps: ["id1108187390"], domains: ["apple.com"], price: 249, suspectPrice: 59, trust: 4.7, homoglyph: 58, logoSim: 69, metaSim: 52, verified: true, clones: 67 },
  { id: "binance", name: "Binance", category: "Crypto", aliases: ["BNB"], handles: ["@binance"], apps: ["com.binance.dev"], domains: ["binance.com"], price: 0, suspectPrice: 0, trust: 3.6, homoglyph: 85, logoSim: 74, metaSim: 88, verified: false, clones: 154 },
];

const seedAlerts: Alert[] = [
  { id: "a1", brandId: "nike", handle: "@nike_supp0rt_help", platform: "Twitter/X", category: "Fake Impersonation", risk: 92, status: "New", date: "2026-10-06" },
  { id: "a2", brandId: "paypal", handle: "PayPaI Secure Wallet", platform: "Google Play", category: "Malware / Fake App", risk: 97, status: "Under Investigation", date: "2026-10-05" },
  { id: "a3", brandId: "nike", handle: "nike.outlet.official70off", platform: "Instagram", category: "Fraudulent Brand Page", risk: 78, status: "New", date: "2026-10-05" },
  { id: "a4", brandId: "apple", handle: "Apple Rewards Team", platform: "LinkedIn", category: "Scam Profile", risk: 64, status: "Takedown Requested", date: "2026-10-04" },
  { id: "a5", brandId: "binance", handle: "Binance Giveaway 2026", platform: "Twitter/X", category: "Scam Profile", risk: 88, status: "New", date: "2026-10-03" },
  { id: "a6", brandId: "apple", handle: "AppIe ID Recovery", platform: "iOS App Store", category: "Malware / Fake App", risk: 84, status: "Under Investigation", date: "2026-10-02" },
  { id: "a7", brandId: "paypal", handle: "@paypal.fan.page", platform: "Instagram", category: "Fraudulent Brand Page", risk: 35, status: "Resolved", date: "2026-09-30" },
];

interface Store {
  brands: Brand[];
  alerts: Alert[];
  settings: Settings;
  history: string[];
  addBrand: (b: Brand) => void;
  updateBrand: (id: string, p: Partial<Brand>) => void;
  removeBrand: (id: string) => void;
  addAlert: (a: Alert) => void;
  updateAlert: (id: string, p: Partial<Alert>) => void;
  resetAll: () => void;
  setStatus: (id: string, s: Status) => void;
  setSettings: (s: Partial<Settings>) => void;
  pushHistory: (q: string) => void;
}
const Ctx = createContext<Store | null>(null);
const KEY = "riskguard-v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [brands, setBrands] = useState(seedBrands);
  const [alerts, setAlerts] = useState(seedAlerts);
  const [settings, setS] = useState<Settings>({ email: true, push: false, weekly: true, apiKey: "", sensitivity: 2 });
  const [history, setHistory] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(KEY) || "null");
      if (d) { setBrands(d.brands); setAlerts(d.alerts); setS((x) => ({ ...x, ...d.settings })); setHistory(d.history ?? []); }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify({ brands, alerts, settings, history }));
  }, [brands, alerts, settings, history, loaded]);

  useEffect(() => { document.documentElement.classList.toggle("fx-off", settings.fx === false); }, [settings.fx]);

  const value: Store = {
    brands, alerts, settings, history,
    addBrand: (b) => setBrands((x) => [...x, b]),
    updateBrand: (id, p) => setBrands((x) => x.map((b) => (b.id === id ? { ...b, ...p } : b))),
    removeBrand: (id) => setBrands((x) => x.filter((b) => b.id !== id)),
    addAlert: (a) => {
      setAlerts((x) => [a, ...x]);
      if (settings.push && a.risk >= 85 && typeof Notification !== "undefined" && Notification.permission === "granted")
        new Notification("High-severity threat logged", { body: `${a.handle} · ${a.platform} · ${a.risk}% risk` });
    },
    updateAlert: (id, p) => setAlerts((x) => x.map((a) => (a.id === id ? { ...a, ...p } : a))),
    resetAll: () => {
      localStorage.removeItem(KEY);
      setBrands(seedBrands); setAlerts(seedAlerts); setHistory([]);
      setS({ email: true, push: false, weekly: true, apiKey: "", sensitivity: 2, fx: true, schedule: "Disabled (Manual)" });
    },
    setStatus: (id, s) => setAlerts((x) => x.map((a) => (a.id === id ? { ...a, status: s } : a))),
    setSettings: (p) => setS((x) => ({ ...x, ...p })),
    pushHistory: (q) => setHistory((h) => [q, ...h.filter((i) => i !== q)].slice(0, 12)),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useStore = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("StoreProvider missing");
  return c;
};

export const riskLevel = (r: number) =>
  r >= 85 ? { label: "Critical", cls: "bg-destructive/20 text-destructive border-destructive" }
  : r >= 65 ? { label: "High", cls: "bg-ember/20 text-ember border-ember" }
  : r >= 40 ? { label: "Medium", cls: "bg-amber/20 text-amber border-amber" }
  : { label: "Safe", cls: "bg-safe/20 text-safe border-safe" };

export const fileToDataUrl = (f: File) =>
  new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(f); });

/* ---- Look-alike engine ---- */
const HOMO: Record<string, string> = { "0": "o", "1": "l", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s", "I": "l", "а": "a", "е": "e", "о": "o", "р": "p", "с": "c", "х": "x", "і": "i", "ӏ": "l", "ν": "v", "ο": "o" };
export const normalize = (s: string) => [...s].map((c) => HOMO[c] ?? c).join("").toLowerCase().replace(/[\s._\-]/g, "");
function lev(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
export function analyze(input: string, brand: string, sensitivity: number) {
  const reasons: string[] = [];
  if (!input.trim()) return { score: 0, flagged: false, reasons };
  const raw = input.toLowerCase(), b = brand.toLowerCase();
  if ([...input].some((c) => c.charCodeAt(0) > 127)) reasons.push("Unicode homoglyph characters detected");
  if (/[01345@$7]/.test(input) && normalize(input).includes(normalize(brand))) reasons.push("Number/symbol swaps (e.g. 0→o)");
  if (/I/.test(input) && b.includes("l")) reasons.push("Capital I used as lowercase l");
  if (/[\s._\-]/.test(input)) reasons.push("Spacing / separator variation");
  const n = normalize(input), nb = normalize(brand);
  if (n.includes(nb) && n !== nb) reasons.push(`Extra words added around "${brand}"`);
  let score: number;
  if (raw === b) score = 100;
  else if (n.includes(nb)) score = 92;
  else score = Math.max(0, Math.round((1 - lev(n, nb) / Math.max(n.length, nb.length)) * 100));
  const thresholds = [99, 85, 72, 55];
  const flagged = raw !== b && score >= thresholds[sensitivity];
  return { score, flagged, reasons };
}
export const SENS = ["Strict Exact", "Typosquatting", "Homoglyph Swap", "Aggressive Fuzzy"];
