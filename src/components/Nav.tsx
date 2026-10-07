import { Link } from "@tanstack/react-router";
import { Home, Columns3, ScanSearch, Siren, MessageSquareHeart, Shield, Settings } from "lucide-react";
import { PantherMark } from "./Panther";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/brands", label: "Brands & Images", icon: Shield },
  { to: "/inspector", label: "Look-alike", icon: ScanSearch },
  { to: "/threats", label: "Threats", icon: Siren },
  { to: "/compare", label: "Compare", icon: Columns3 },
  { to: "/sentiment", label: "Sentiment", icon: MessageSquareHeart },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Nav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-void/85 backdrop-blur-xl md:inset-y-0 md:left-0 md:right-auto md:w-60 md:border-t-0 md:border-r">
      <Link to="/" className="hidden items-center gap-3 px-5 py-6 md:flex">
        <PantherMark className="h-10 w-10" />
        <div className="leading-tight">
          <div className="font-display text-sm font-bold tracking-widest text-blood">VIBRANIUM</div>
          <div className="font-display text-xs tracking-[0.3em] text-muted-foreground">RISKGUARD</div>
        </div>
      </Link>
      <ul className="flex justify-around md:flex-col md:gap-1 md:px-3">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="group flex flex-col items-center gap-1 rounded-lg px-3 py-2.5 text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-wine/40 hover:text-foreground hover:shadow-[var(--glow)] active:scale-90 md:flex-row md:gap-3"
              activeProps={{ className: "icon-active bg-wine/60 text-foreground shadow-[var(--glow)] border-l-2 border-magenta" }}
            >
              <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6" />
              <span className="text-[10px] font-semibold md:text-base">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
