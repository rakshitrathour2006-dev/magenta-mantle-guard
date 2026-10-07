import { useEffect, useState } from "react";

/** Big blinking panther eyes. */
export function PantherEyes({ size = 360 }: { size?: number }) {
  return (
    <svg viewBox="0 0 400 140" width={size} height={(size * 140) / 400} className="panther-eyes" aria-hidden>
      <defs>
        <radialGradient id="iris" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.95 0.12 60)" />
          <stop offset="35%" stopColor="oklch(0.65 0.27 350)" />
          <stop offset="100%" stopColor="oklch(0.35 0.15 15)" />
        </radialGradient>
      </defs>
      {[{ x: 100, flip: 1 }, { x: 300, flip: -1 }].map(({ x, flip }) => (
        <g key={x} className="panther-eye">
          <path
            transform={`translate(${x} 70) scale(${flip} 1)`}
            d="M-85 10 C-55 -45 40 -55 85 -20 C55 30 -30 45 -85 10 Z"
            fill="url(#iris)"
            stroke="oklch(0.62 0.27 350)"
            strokeWidth="3"
          />
          <ellipse cx={x} cy={68} rx="9" ry="34" fill="oklch(0.08 0 0)" />
          <circle cx={x - 18 * flip} cy={52} r="6" fill="oklch(1 0 0 / .85)" />
        </g>
      ))}
    </svg>
  );
}

/** Fullscreen loader: panther eyes blinking on a plain void screen. */
export function PantherLoader({ label = "Awakening the Panther" }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-void">
      <PantherEyes size={420} />
      <WaveBars />
      <p className="font-display text-sm tracking-[0.4em] text-muted-foreground uppercase">{label}</p>
    </div>
  );
}

export function WaveBars({ n = 9 }: { n?: number }) {
  return (
    <div className="flex h-10 items-center gap-1.5">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="wavebar h-full w-1.5 rounded-full bg-blood" style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  );
}

export function PulseWaves({ size = 140 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {[0, 0.5, 1, 1.5].map((d) => (
        <span key={d} className="pulse-ring absolute inset-0 rounded-full border-2 border-magenta" style={{ animationDelay: `${d}s` }} />
      ))}
      <span className="h-4 w-4 rounded-full bg-blood glow" />
    </div>
  );
}

export function Ribbon() {
  return (
    <svg viewBox="0 0 600 60" className="h-10 w-full" aria-hidden>
      <path d="M0 30 Q75 0 150 30 T300 30 T450 30 T600 30" fill="none" stroke="oklch(0.3 0.08 15)" strokeWidth="2" />
      <path className="ribbon" d="M0 30 Q75 0 150 30 T300 30 T450 30 T600 30" fill="none" stroke="oklch(0.62 0.27 350)" strokeWidth="4" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px oklch(0.62 0.27 350))" }} />
    </svg>
  );
}

export function PantherMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <path d="M8 10 L20 22 L32 16 L44 22 L56 10 L54 34 Q50 52 32 58 Q14 52 10 34 Z" fill="oklch(0.1 0.01 20)" stroke="oklch(0.62 0.27 350)" strokeWidth="2.5" />
      <path d="M18 32 L28 36 M46 32 L36 36" stroke="oklch(0.65 0.27 350)" strokeWidth="3" strokeLinecap="round" className="panther-eye" />
      <path d="M28 46 L32 50 L36 46" stroke="oklch(0.58 0.24 15)" strokeWidth="2" fill="none" />
    </svg>
  );
}

export function Claws({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={`claw ${className}`} aria-hidden>
      {[0, 22, 44].map((o) => (
        <path key={o} d={`M${20 + o} 10 Q${40 + o} 60 ${30 + o} 110`} stroke="oklch(0.62 0.27 350)" strokeWidth="4" fill="none" strokeLinecap="round" />
      ))}
    </svg>
  );
}

/** Shows loader on first mount, and whenever the browser goes offline. */
export function BootGate() {
  const [boot, setBoot] = useState(true);
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setBoot(false), 1600);
    const on = () => setOffline(false), off = () => setOffline(true);
    setOffline(!navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { clearTimeout(t); window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  if (offline) return <PantherLoader label="Signal lost — the Panther waits" />;
  if (boot) return <PantherLoader />;
  return null;
}
