import { useCountdown } from "./useCountdown";

type Props = {
  storageKey: string;
  durationMs?: number;
  label?: string;
  className?: string;
};

export function CountdownTimer({
  storageKey,
  durationMs,
  label = "До конца предложения",
  className = "",
}: Props) {
  const { hours, minutes, seconds, ready } = useCountdown(storageKey, durationMs);
  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className={className}>
      <div className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 flex items-center gap-2 font-serif text-2xl tabular-nums md:text-3xl">
        <TimeBox value={ready ? pad(hours) : "--"} unit="ч" />
        <span className="text-muted-foreground">:</span>
        <TimeBox value={ready ? pad(minutes) : "--"} unit="мин" />
        <span className="text-muted-foreground">:</span>
        <TimeBox value={ready ? pad(seconds) : "--"} unit="сек" />
      </div>
    </div>
  );
}

function TimeBox({ value, unit }: { value: string; unit: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="rounded-lg bg-foreground/5 px-2.5 py-1.5 text-foreground">
        {value}
      </span>
      <span className="mt-1 text-[9px] uppercase tracking-widest text-muted-foreground">
        {unit}
      </span>
    </div>
  );
}
