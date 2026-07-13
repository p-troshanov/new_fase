import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";
import { trackEvent } from "@/lib/analytics";

type Variant = "course" | "intensive";

const CONFIG: Record<
  Variant,
  {
    storageKey: string;
    timerKey: string;
    badge: string;
    title: ReactNode;
    description: ReactNode;
    ctaText: string;
    to: "/course" | "/intensive";
    search: Record<string, string>;
  }
> = {
  course: {
    storageKey: "newface:exitintent:course",
    timerKey: "exit-course",
    badge: "Подождите",
    title: (
      <>
        Дарим ещё <span className="italic text-primary">−6%</span> и{" "}
        бонус-урок «Экспресс-лифтинг&nbsp;за&nbsp;5&nbsp;минут»
      </>
    ),
    description: (
      <>
        Если оформите курс сейчас — цена{" "}
        <span className="font-medium text-foreground">2 690 ₽</span> вместо
        2 990 ₽ + отдельный бонус-урок в подарок.
      </>
    ),
    ctaText: "Забрать за 2 690 ₽",
    to: "/course",
    search: { offer: "exit" },
  },
  intensive: {
    storageKey: "newface:exitintent:intensive",
    timerKey: "exit-intensive",
    badge: "Подождите",
    title: (
      <>
        Заберите интенсив за <span className="italic text-primary">390 ₽</span>{" "}
        вместо 590 ₽
      </>
    ),
    description: (
      <>
        Дополнительная скидка −34% действует один раз. Плюс шаблон «утро без
        отёков» на неделю в подарок.
      </>
    ),
    ctaText: "Забрать за 390 ₽",
    to: "/intensive",
    search: { promo: "lastcall" },
  },
};

/**
 * Exit-intent modal. Shows once per session when the cursor leaves the top
 * edge of the viewport (desktop) or after 45s (mobile).
 */
export function ExitIntentModal({ variant = "course" }: { variant?: Variant }) {
  const [open, setOpen] = useState(false);
  const cfg = CONFIG[variant];

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(cfg.storageKey)) return;

    const show = () => {
      setOpen(true);
      window.sessionStorage.setItem(cfg.storageKey, "1");
      trackEvent("view:exitintent", { variant });
    };

    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        show();
        document.removeEventListener("mouseout", onLeave);
      }
    };
    document.addEventListener("mouseout", onLeave);

    const t = window.setTimeout(() => {
      if (!window.sessionStorage.getItem(cfg.storageKey)) show();
    }, 45_000);

    return () => {
      document.removeEventListener("mouseout", onLeave);
      window.clearTimeout(t);
    };
  }, [cfg.storageKey, variant]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-card p-8 shadow-2xl md:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Закрыть"
          className="absolute right-5 top-5 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
          {cfg.badge}
        </div>
        <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
          {cfg.title}
        </h2>
        <p className="mt-4 text-sm text-muted-foreground md:text-[15px]">
          {cfg.description}
        </p>

        <div className="mt-5">
          <CountdownTimer
            storageKey={cfg.timerKey}
            durationMs={30 * 60 * 1000}
            label="Специальная цена действует"
          />
        </div>

        <Link
          to={cfg.to}
          search={cfg.search as never}
          onClick={() => {
            trackEvent("click:exitintent_cta", { variant });
            setOpen(false);
          }}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-[15px] font-medium text-primary-foreground transition hover:brightness-105"
        >
          {cfg.ctaText}
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-3 w-full text-xs text-muted-foreground hover:text-foreground"
        >
          Нет, спасибо
        </button>
      </div>
    </div>
  );
}
