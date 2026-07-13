import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X, ArrowRight, Flame } from "lucide-react";
import { useCountdown } from "./useCountdown";
import { trackEvent } from "@/lib/analytics";

/**
 * Sticky bottom bar with looped 24h personal offer.
 * Dismissible for 12h via localStorage.
 */
export function OfferBar() {
  const [visible, setVisible] = useState(false);
  const { formatted, ready } = useCountdown("first-order", 24 * 60 * 60 * 1000);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissedUntil = parseInt(
      window.localStorage.getItem("newface:offerbar:dismissed") ?? "0",
      10,
    );
    if (!dismissedUntil || Date.now() > dismissedUntil) {
      const t = window.setTimeout(() => {
        setVisible(true);
        trackEvent("view:offerbar");
      }, 1200);
      return () => window.clearTimeout(t);
    }
  }, []);

  if (!visible || !ready) return null;

  const dismiss = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "newface:offerbar:dismissed",
        String(Date.now() + 12 * 60 * 60 * 1000),
      );
    }
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 md:px-8 md:py-3.5">
        <div className="hidden h-10 w-10 flex-none items-center justify-center rounded-full bg-primary/15 text-primary md:flex">
          <Flame className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] uppercase tracking-[0.25em] text-primary">
            Персональное предложение
          </div>
          <div className="mt-0.5 truncate text-[13px] text-foreground md:text-sm">
            Полный курс NEW FACE со скидкой −40% — сгорит через{" "}
            <span className="font-medium tabular-nums">{formatted}</span>
          </div>
        </div>
        <Link
          to="/course"
          search={{ offer: "first" }}
          onClick={() => trackEvent("click:offerbar_cta")}
          className="inline-flex flex-none items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition hover:brightness-105 md:px-5 md:py-2.5 md:text-sm"
        >
          Забрать
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Скрыть"
          className="flex-none text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
