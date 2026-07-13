import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

interface QuizShellProps {
  step: number;
  total: number;
  eyebrow?: string;
  children: ReactNode;
  onBack?: () => void;
}

export function QuizShell({ step, total, eyebrow, children, onBack }: QuizShellProps) {
  const pct = Math.min(100, Math.round((step / total) * 100));
  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto max-w-2xl px-5 pt-8 pb-16 md:px-8 md:pt-12">
        <div className="mb-8 flex items-center justify-between">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Назад
            </button>
          ) : (
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> На главную
            </Link>
          )}
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {eyebrow ?? "NEW FACE"}
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Шаг {Math.min(step, total)} из {total}
            </span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="animate-fade-in">{children}</div>
      </div>
    </main>
  );
}

interface OptionCardProps {
  label: string;
  hint?: string;
  selected?: boolean;
  onClick: () => void;
}

export function OptionCard({ label, hint, selected, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-2xl border px-5 py-4 text-left transition-all hover:border-primary hover:bg-card ${
        selected
          ? "border-primary bg-primary/5 shadow-[0_10px_30px_-15px_rgba(120,80,50,0.35)]"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
            selected ? "border-primary bg-primary" : "border-muted-foreground/40"
          }`}
        >
          {selected && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
        </div>
        <div className="flex-1">
          <div className="text-[15px] font-medium text-foreground">{label}</div>
          {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
        </div>
      </div>
    </button>
  );
}
