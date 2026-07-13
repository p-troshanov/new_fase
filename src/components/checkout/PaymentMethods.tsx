import { CreditCard, Smartphone, CalendarClock, Info, Check } from "lucide-react";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_KEYS,
  splitInstallments,
  type PaymentMethodKey,
} from "@/lib/payment-methods";

/**
 * Способы оплаты. Может работать в трёх режимах:
 *   • variant="select"  — выбор способа перед оплатой (в модалке/на странице).
 *   • variant="compact" — небольшой блок под кнопкой на лендинге.
 *   • variant="inline"  — тонкая строка бейджей в модалке.
 *   • variant="full"    — большой блок с двумя карточками (карта / частями).
 * Везде «4 × X ₽» пересчитывается из props.price.
 */

type Variant = "full" | "compact" | "inline" | "select";

const bnplKeys: PaymentMethodKey[] = ["dolyame", "halva", "ozon", "wb"];
const instantKeys: PaymentMethodKey[] = ["card", "sbp"];

const fmt = (n: number) => n.toLocaleString("ru-RU").replace(",", " ") + " ₽";

export function PaymentMethods({
  variant = "full",
  price,
  value,
  onChange,
}: {
  variant?: Variant;
  price?: number;
  value?: PaymentMethodKey;
  onChange?: (key: PaymentMethodKey) => void;
}) {
  const parts = price ? Math.ceil(price / 4) : null;

  if (variant === "inline") {
    return (
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
        <CalendarClock className="h-3 w-3 text-primary" strokeWidth={2} />
        <span>Можно частями:</span>
        {bnplKeys.map((k) => (
          <span
            key={k}
            className="rounded-full border border-border bg-secondary/60 px-2 py-0.5 font-medium text-foreground/80"
          >
            {PAYMENT_METHODS[k].short}
          </span>
        ))}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="rounded-2xl border border-border bg-secondary/40 p-4">
        <div className="flex items-center gap-2 text-xs font-medium">
          <CalendarClock className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
          <span>Оплата частями без переплаты</span>
          {parts && (
            <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
              4 × {fmt(parts)}
            </span>
          )}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {bnplKeys.map((k) => (
            <span
              key={k}
              className="rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium"
            >
              {PAYMENT_METHODS[k].short}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "select") {
    return (
      <div className="space-y-3">
        <div className="text-xs font-medium text-muted-foreground">
          Способ оплаты
        </div>

        <div className="space-y-2">
          <SectionLabel>Оплата сразу</SectionLabel>
          {instantKeys.map((k) => (
            <MethodRow
              key={k}
              info={PAYMENT_METHODS[k]}
              selected={value === k}
              onClick={() => onChange?.(k)}
              price={price ?? undefined}
            />
          ))}

          <SectionLabel className="pt-2">
            Частями без переплаты
            {parts && (
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                4 × {fmt(parts)}
              </span>
            )}
          </SectionLabel>
          {bnplKeys.map((k) => (
            <MethodRow
              key={k}
              info={PAYMENT_METHODS[k]}
              selected={value === k}
              onClick={() => onChange?.(k)}
              price={price ?? undefined}
            />
          ))}
        </div>
      </div>
    );
  }

  // full
  return (
    <div className="rounded-3xl border border-border bg-card p-5 md:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Способы оплаты
          </div>
          <div className="mt-1.5 font-serif text-lg leading-tight">
            Картой, СБП или частями без переплаты
          </div>
        </div>
        {parts && (
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Частями
            </div>
            <div className="mt-1 font-serif text-xl leading-none">
              4 × {fmt(parts)}
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-secondary/40 p-4">
          <div className="flex items-center gap-2 text-xs font-medium">
            <CreditCard className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
            Сразу
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {["Visa", "Mastercard", "Мир", "СБП", "Apple Pay", "Google Pay"].map((m) => (
              <span
                key={m}
                className="rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium"
              >
                {m === "СБП" ? (
                  <span className="inline-flex items-center gap-1">
                    <Smartphone className="h-3 w-3" strokeWidth={2} />
                    СБП
                  </span>
                ) : (
                  m
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-secondary/40 p-4">
          <div className="flex items-center gap-2 text-xs font-medium">
            <CalendarClock className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
            4 платежа без комиссии
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {bnplKeys.map((k) => (
              <span
                key={k}
                title={PAYMENT_METHODS[k].tag}
                className="rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium"
              >
                {PAYMENT_METHODS[k].short}
              </span>
            ))}
          </div>
        </div>
      </div>

      {parts && price && (
        <InstallmentSchedule price={price} />
      )}

      <div className="mt-4 flex items-start gap-2 text-[11px] text-muted-foreground">
        <Info className="mt-0.5 h-3 w-3 flex-none text-primary" />
        <span>
          Первый платёж — сегодня, ещё три — по расписанию раз в 2 недели.
          Без процентов, без справок, решение банка — за 15 секунд.
        </span>
      </div>
    </div>
  );
}

function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center text-[10px] uppercase tracking-[0.22em] text-muted-foreground ${className}`}
    >
      {children}
    </div>
  );
}

function MethodRow({
  info,
  selected,
  onClick,
  price,
}: {
  info: (typeof PAYMENT_METHODS)[PaymentMethodKey];
  selected: boolean;
  onClick: () => void;
  price?: number;
}) {
  const parts =
    info.installments > 1 && price
      ? splitInstallments(price, info.installments)
      : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-foreground/30"
      }`}
    >
      <span
        className={`mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full border ${
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
        }`}
      >
        {selected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
      </span>
      <span className="flex-1">
        <span className="flex items-center gap-2">
          <span className="text-sm font-medium">{info.label}</span>
          <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {info.tag}
          </span>
        </span>
        <span className="mt-0.5 block text-[11px] text-muted-foreground">
          {info.description}
        </span>
        {parts && (
          <span className="mt-1.5 block text-[11px] font-medium text-primary">
            {info.installments} × {fmt(parts[0])} каждые 2 недели
          </span>
        )}
      </span>
    </button>
  );
}

function InstallmentSchedule({ price }: { price: number }) {
  const parts = splitInstallments(price, 4);
  const today = new Date();
  const dates = parts.map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i * 14);
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  });
  return (
    <div className="mt-4 rounded-2xl border border-border bg-background p-3">
      <div className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
        График платежей
      </div>
      <div className="grid grid-cols-4 gap-2">
        {parts.map((p, i) => (
          <div
            key={i}
            className={`rounded-xl border p-2 text-center ${
              i === 0 ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <div className="text-[10px] text-muted-foreground">
              {i === 0 ? "Сегодня" : dates[i]}
            </div>
            <div className="mt-0.5 text-xs font-semibold">{fmt(p)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
