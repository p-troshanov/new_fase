import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, Sparkles, ArrowRight, Gift } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

/**
 * "Испытайте удачу" — колесо фортуны с гарантированной скидкой на курс.
 * Скидки от 55% до 98% (98% — крайне редкая), взвешенные вероятности.
 * Приз сохраняется в localStorage и передаётся на /course через ?wheel=<pct>.
 */

type Prize = {
  label: string;
  pct: number;
  weight: number;
  color: string;
};

// Порядок сегментов на колесе (по часовой стрелке, начиная с верха)
const PRIZES: Prize[] = [
  { label: "−55%", pct: 55, weight: 26, color: "hsl(30 30% 92%)" },
  { label: "−70%", pct: 70, weight: 20, color: "hsl(28 45% 78%)" },
  { label: "−60%", pct: 60, weight: 24, color: "hsl(30 30% 92%)" },
  { label: "−85%", pct: 85, weight: 8, color: "hsl(28 45% 78%)" },
  { label: "−65%", pct: 65, weight: 20, color: "hsl(30 30% 92%)" },
  { label: "−98%", pct: 98, weight: 1, color: "hsl(24 60% 55%)" },
  { label: "−75%", pct: 75, weight: 15, color: "hsl(28 45% 78%)" },
  { label: "−80%", pct: 80, weight: 11, color: "hsl(30 30% 92%)" },
];

const STORAGE_KEY = "newface:wheel-prize";
const SHOWN_KEY = "newface:wheel-shown";
const SEG = 360 / PRIZES.length;

function pickPrizeIndex(): number {
  const total = PRIZES.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < PRIZES.length; i++) {
    r -= PRIZES[i].weight;
    if (r <= 0) return i;
  }
  return 0;
}

export function FortuneWheel({
  triggerDelayMs = 12000,
  autoOpen = true,
}: {
  triggerDelayMs?: number;
  autoOpen?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prizeIdx, setPrizeIdx] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  // Auto-open on delay if user hasn't already claimed a prize
  useEffect(() => {
    if (!autoOpen) return;
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(STORAGE_KEY)) return;
    if (window.sessionStorage.getItem(SHOWN_KEY)) return;
    timerRef.current = window.setTimeout(() => {
      setOpen(true);
      window.sessionStorage.setItem(SHOWN_KEY, "1");
      trackEvent("view:wheel");
    }, triggerDelayMs);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [autoOpen, triggerDelayMs]);

  const prize = prizeIdx !== null ? PRIZES[prizeIdx] : null;

  const segments = useMemo(
    () =>
      PRIZES.map((p, i) => {
        const start = i * SEG - 90 - SEG / 2;
        const end = start + SEG;
        const large = SEG > 180 ? 1 : 0;
        const r = 140;
        const cx = 150;
        const cy = 150;
        const x1 = cx + r * Math.cos((start * Math.PI) / 180);
        const y1 = cy + r * Math.sin((start * Math.PI) / 180);
        const x2 = cx + r * Math.cos((end * Math.PI) / 180);
        const y2 = cy + r * Math.sin((end * Math.PI) / 180);
        const midA = ((start + end) / 2) * (Math.PI / 180);
        const tx = cx + 90 * Math.cos(midA);
        const ty = cy + 90 * Math.sin(midA);
        const rot = (start + end) / 2 + 90;
        return {
          i,
          d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`,
          fill: p.color,
          label: p.label,
          tx,
          ty,
          rot,
          rare: p.pct >= 85,
        };
      }),
    [],
  );

  function spin() {
    if (spinning || prizeIdx !== null) return;
    const idx = pickPrizeIndex();
    // pointer is at top (0deg after -90 offset). We want segment idx to land at top.
    // Each segment centered at idx * SEG. We rotate wheel by -idx*SEG (mod 360) plus extra turns.
    const target = 360 * 6 + (360 - idx * SEG);
    setSpinning(true);
    setRotation((prev) => prev + target);
    trackEvent("click:wheel_spin");
    window.setTimeout(() => {
      setSpinning(false);
      setPrizeIdx(idx);
      const p = PRIZES[idx];
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ pct: p.pct, label: p.label, ts: Date.now() }),
        );
      } catch {
        /* noop */
      }
      trackEvent("wheel:won", { pct: p.pct });
    }, 4600);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-background p-6 shadow-2xl md:p-10">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          aria-label="Закрыть"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>

        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-3 w-3" strokeWidth={2} />
            Только сейчас
          </span>
          <h3 className="mt-3 font-serif text-3xl leading-tight md:text-4xl">
            {prize ? "Ваш приз" : "Испытайте удачу"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground md:text-[15px]">
            {prize
              ? "Скидка закреплена за вами. Действует 30 минут."
              : "Один спин на скидку до 98% на полный курс NEW FACE."}
          </p>
        </div>

        <div className="relative mx-auto mt-6 h-[300px] w-[300px] select-none">
          {/* Pointer */}
          <div className="absolute left-1/2 top-[-6px] z-10 -translate-x-1/2">
            <div className="h-0 w-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-primary drop-shadow" />
          </div>

          <svg
            viewBox="0 0 300 300"
            className="h-full w-full drop-shadow-[0_15px_35px_rgba(120,80,50,0.25)]"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? "transform 4.5s cubic-bezier(0.16, 1, 0.3, 1)"
                : "none",
            }}
          >
            <circle cx="150" cy="150" r="145" fill="hsl(24 40% 40%)" />
            {segments.map((s) => (
              <g key={s.i}>
                <path d={s.d} fill={s.fill} stroke="hsl(24 40% 40%)" strokeWidth="2" />
                <text
                  x={s.tx}
                  y={s.ty}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="'Playfair Display', serif"
                  fontSize={s.rare ? "20" : "17"}
                  fontWeight={s.rare ? 700 : 500}
                  fill={s.rare ? "hsl(30 30% 98%)" : "hsl(24 40% 25%)"}
                  transform={`rotate(${s.rot} ${s.tx} ${s.ty})`}
                >
                  {s.label}
                </text>
              </g>
            ))}
            <circle cx="150" cy="150" r="22" fill="hsl(30 30% 98%)" stroke="hsl(24 40% 40%)" strokeWidth="3" />
          </svg>
        </div>

        {!prize ? (
          <button
            type="button"
            onClick={spin}
            disabled={spinning}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-[15px] font-medium text-primary-foreground transition hover:brightness-105 disabled:opacity-70"
          >
            {spinning ? "Крутим..." : "Крутить колесо"}
          </button>
        ) : (
          <div className="mt-8 space-y-4 text-center">
            <div className="rounded-2xl border border-primary/30 bg-primary/10 p-5">
              <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.24em] text-primary">
                <Gift className="h-3.5 w-3.5" strokeWidth={2} />
                Ваш выигрыш
              </div>
              <div className="mt-2 font-serif text-5xl text-foreground">
                {prize.label}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                на полный курс NEW FACE
              </p>
            </div>
            <Link
              to="/course"
              search={{ wheel: prize.pct } as never}
              onClick={() => {
                trackEvent("click:wheel_claim", { pct: prize.pct });
                setOpen(false);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-[15px] font-medium text-primary-foreground transition hover:brightness-105"
            >
              Забрать курс со скидкой {prize.label}
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        )}

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Один спин на пользователя. Приз не суммируется с другими акциями.
        </p>
      </div>
    </div>
  );
}

/**
 * Read a previously-won wheel prize (if any).
 */
export function readWheelPrize(): { pct: number; label: string; ts: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
