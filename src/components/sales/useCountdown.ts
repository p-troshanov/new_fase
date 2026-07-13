import { useEffect, useState } from "react";

/**
 * Persistent countdown timer stored in localStorage.
 * Once set, deadline stays the same across reloads until it expires.
 * When expired, resets to a fresh `durationMs` window (looped urgency).
 */
export function useCountdown(key: string, durationMs: number = 24 * 60 * 60 * 1000) {
  const [now, setNow] = useState(() => Date.now());
  const [deadline, setDeadline] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storageKey = `newface:offer:${key}`;
    const stored = window.localStorage.getItem(storageKey);
    let dl = stored ? parseInt(stored, 10) : NaN;
    if (!dl || Number.isNaN(dl) || dl - Date.now() < 0) {
      dl = Date.now() + durationMs;
      window.localStorage.setItem(storageKey, String(dl));
    }
    setDeadline(dl);
    const t = window.setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (dl - n < 0) {
        const nextDl = n + durationMs;
        window.localStorage.setItem(storageKey, String(nextDl));
        dl = nextDl;
        setDeadline(nextDl);
      }
    }, 1000);
    return () => window.clearInterval(t);
  }, [key, durationMs]);

  const remaining = Math.max(0, (deadline ?? now + durationMs) - now);
  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  return {
    hours,
    minutes,
    seconds,
    formatted: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
    ready: deadline !== null,
  };
}
