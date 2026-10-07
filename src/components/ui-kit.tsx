import { useState, type ButtonHTMLAttributes, type ReactNode, type MouseEvent } from "react";
import { X } from "lucide-react";

type V = "primary" | "ghost" | "danger";
const vcls: Record<V, string> = {
  primary: "bg-blood text-primary-foreground glow hover:brightness-125",
  ghost: "border border-border bg-secondary/60 text-foreground hover:border-magenta hover:shadow-[var(--glow)]",
  danger: "border border-destructive bg-destructive/15 text-destructive hover:bg-destructive/30",
};

export function Btn({ variant = "primary", className = "", children, onClick, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: V }) {
  const [rips, setRips] = useState<{ id: number; x: number; y: number }[]>([]);
  const click = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRips((x) => [...x, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setRips((x) => x.filter((i) => i.id !== id)), 600);
    onClick?.(e);
  };
  return (
    <button
      {...p}
      onClick={click}
      className={`relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg px-5 py-2.5 font-semibold tracking-wide transition-all duration-200 active:scale-95 disabled:opacity-50 ${vcls[variant]} ${className}`}
    >
      {rips.map((r) => <span key={r.id} className="ripple h-10 w-10" style={{ left: r.x - 20, top: r.y - 20 }} />)}
      {children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`glass p-6 ${className}`}>{children}</div>;
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8 fadeup">
      <h1 className="text-3xl font-bold md:text-4xl"><span className="text-blood">{title}</span></h1>
      <p className="mt-2 max-w-2xl text-lg text-muted-foreground">{subtitle}</p>
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="glass fadeup max-h-[90vh] w-full max-w-2xl overflow-auto p-6 glow" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted" aria-label="Close"><X /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const inputCls = "w-full rounded-lg border border-input bg-void/60 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-magenta focus:outline-none focus:shadow-[var(--glow)] transition";
