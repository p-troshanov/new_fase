import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { User, Mail, Gift, Phone, Send } from "lucide-react";
import { submitLead } from "@/lib/leads.functions";


interface LeadCaptureFormProps {
  source: string;
  answers?: Record<string, unknown>;
  cta: string;
  note?: string;
  /** show optional phone + telegram inputs (used on the main starter-kit form) */
  extendedContacts?: boolean;
}

export function LeadCaptureForm({
  source,
  answers,
  cta,
  note,
  extendedContacts = false,
}: LeadCaptureFormProps) {
  const navigate = useNavigate();
  const submit = useServerFn(submitLead);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const startedAt = useRef<number>(Date.now());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
          await submit({
            data: {
              name,
              email,
              phone: extendedContacts && phone ? phone : undefined,
              telegram: extendedContacts && telegram ? telegram : undefined,
              source,
              answers,
              website,
              startedAt: startedAt.current,
            },
          });

          // Persist quiz answers for deeper personalization on /thanks and beyond.
          if (typeof window !== "undefined" && answers) {
            try {
              window.localStorage.setItem(
                "newface:answers",
                JSON.stringify({ source, answers, name, ts: Date.now() }),
              );
            } catch {
              /* noop */
            }
          }
          await navigate({ to: "/thanks", search: { name, source } });
        } catch (err) {
          setError(err instanceof Error ? err.message : "Что-то пошло не так");
          setLoading(false);
        }
      }}
      className="space-y-3"
    >
      {/* Honeypot: hidden from real users, bots fill it in */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />
      <label className="relative block">

        <User
          className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.5}
        />
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ваше имя"
          maxLength={100}
          className="w-full rounded-2xl border border-border bg-card py-4 pl-12 pr-5 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </label>
      <label className="relative block">
        <Mail
          className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.5}
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ваш email"
          maxLength={255}
          className="w-full rounded-2xl border border-border bg-card py-4 pl-12 pr-5 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </label>

      {extendedContacts && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="relative block">
            <Phone
              className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.5}
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Телефон (не обязательно)"
              maxLength={30}
              className="w-full rounded-2xl border border-border bg-card py-4 pl-12 pr-5 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="relative block">
            <Send
              className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.5}
            />
            <input
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="Telegram @username"
              maxLength={64}
              className="w-full rounded-2xl border border-border bg-card py-4 pl-12 pr-5 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-1 w-full rounded-2xl bg-primary py-4 text-[15px] font-medium text-primary-foreground transition hover:brightness-105 active:brightness-95 disabled:opacity-60"
      >
        {loading ? "Отправляем…" : cta}
      </button>
      {error && <p className="text-center text-xs text-destructive">{error}</p>}
      {note && (
        <p className="flex items-center justify-center gap-2 pt-2 text-center text-xs text-muted-foreground">
          <Gift className="h-3.5 w-3.5" strokeWidth={1.5} />
          {note}
        </p>
      )}
    </form>
  );
}
