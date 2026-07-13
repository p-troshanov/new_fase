import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CheckCircle2, Loader2, Mail, ArrowRight, AlertTriangle, Clock, CreditCard } from "lucide-react";
import { getOrderStatus, type OrderStatusResult } from "@/lib/orders.functions";
import { trackEvent } from "@/lib/analytics";
import {
  getPaymentMethod,
  splitInstallments,
} from "@/lib/payment-methods";

export const Route = createFileRoute("/payment-success")({
  validateSearch: z.object({ invoice: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Оплата прошла — NEW FACE" },
      { name: "description", content: "Спасибо за оплату. Доступ откроется сразу после подтверждения платежа." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaymentSuccessPage,
});

const fmt = (n: number) => n.toLocaleString("ru-RU").replace(",", " ") + " ₽";

function PaymentSuccessPage() {
  const { invoice } = useSearch({ from: "/payment-success" });
  const check = useServerFn(getOrderStatus);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderStatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!invoice) {
      setLoading(false);
      return;
    }
    let stop = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function poll(n: number) {
      try {
        const res = await check({ data: { invoiceId: invoice! } });
        if (stop) return;
        setOrder(res);
        setError(null);
        setAttempt(n);
        // Пока pending — опрашиваем несколько раз с ростом интервала (webhook догоняет)
        if (res.found && res.status === "pending" && n < 8) {
          timer = setTimeout(() => poll(n + 1), Math.min(1500 * (n + 1), 6000));
        } else {
          setLoading(false);
        }
      } catch (err) {
        if (stop) return;
        setError(err instanceof Error ? err.message : "Не удалось проверить статус");
        setLoading(false);
      }
    }

    trackEvent("payment:success_page", { invoice });
    poll(0);
    return () => {
      stop = true;
      if (timer) clearTimeout(timer);
    };
  }, [invoice, check]);

  const status = order?.status ?? null;

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto max-w-xl px-5 pt-16 pb-24 md:pt-24">
        <Link to="/" className="inline-block">
          <div className="font-serif text-xl tracking-[0.28em]">NEW FACE</div>
          <div className="mt-1.5 text-[10px] tracking-[0.32em] uppercase text-muted-foreground">
            Natural Face Method
          </div>
        </Link>

        <div className="mt-12 rounded-3xl border border-border bg-card p-8 md:p-10">
          {!invoice ? (
            <EmptyState />
          ) : loading ? (
            <StateWrap
              icon={<Loader2 className="h-7 w-7 animate-spin text-primary" />}
              title="Подтверждаем оплату…"
              subtitle={
                attempt > 0
                  ? "Платёж почти проведён. Обычно это занимает несколько секунд."
                  : "Секунду, проверяем статус заказа."
              }
            />
          ) : error ? (
            <StateWrap
              icon={<AlertTriangle className="h-7 w-7 text-destructive" />}
              title="Не удалось проверить статус"
              subtitle={error}
              action={
                <button
                  onClick={() => window.location.reload()}
                  className="mt-6 rounded-2xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:brightness-105"
                >
                  Попробовать ещё раз
                </button>
              }
            />
          ) : !order?.found ? (
            <StateWrap
              icon={<AlertTriangle className="h-7 w-7 text-destructive" />}
              title="Заказ не найден"
              subtitle={`Мы не нашли заказ с номером ${invoice}. Если вы только что оплатили — обновите страницу через минуту.`}
              action={<HomeLink />}
            />
          ) : status === "paid" ? (
            <StateWrap
              icon={<CheckCircle2 className="h-7 w-7 text-primary" />}
              title="Оплата прошла — доступ открыт"
              subtitle={
                <>
                  Спасибо! Мы отправили письмо с доступом{" "}
                  {order.email ? <b className="text-foreground">{order.email}</b> : "на ваш email"}.
                  Проверьте входящие и «Промоакции» — если письма нет, напишите нам.
                </>
              }
              meta={
                <>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                    <MetaCell label="Сумма" value={order.amountRub ? fmt(order.amountRub) : "—"} />
                    <MetaCell label="Заказ №" value={order.invoiceId.split("-").slice(-1)[0]} />
                  </div>
                  <PaymentMethodDetails order={order} />
                </>
              }
              action={
                <div className="mt-6 flex flex-col gap-2">
                  <a
                    href={`mailto:hello@newface.example?subject=Доступ%20к%20курсу%20${order.invoiceId}`}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-medium text-primary-foreground hover:brightness-105"
                  >
                    <Mail className="h-4 w-4" />
                    Не пришло письмо? Написать нам
                  </a>
                  <HomeLink />
                </div>
              }
            />
          ) : status === "pending" ? (
            <StateWrap
              icon={<Clock className="h-7 w-7 text-primary" />}
              title="Ждём подтверждение банка"
              subtitle={
                getPaymentMethod(order.paymentMethod)?.pendingHint ??
                "Заказ создан, но банк ещё не подтвердил оплату. Обычно это занимает до пары минут. Мы пришлём письмо, как только всё пройдёт."
              }
              meta={<PaymentMethodDetails order={order} />}
              action={<HomeLink />}
            />
          ) : status === "failed" ? (
            <StateWrap
              icon={<AlertTriangle className="h-7 w-7 text-destructive" />}
              title="Оплата не прошла"
              subtitle={
                getPaymentMethod(order.paymentMethod)?.failedHint ??
                "Банк отклонил платёж. Попробуйте другую карту или оплатить ещё раз."
              }
              meta={<PaymentMethodDetails order={order} />}
              action={
                <Link
                  to="/course"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-medium text-primary-foreground hover:brightness-105"
                >
                  Попробовать снова
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
          ) : (
            <StateWrap
              icon={<AlertTriangle className="h-7 w-7 text-destructive" />}
              title={`Статус: ${status}`}
              subtitle="Если что-то пошло не так — напишите нам, разберёмся."
              action={<HomeLink />}
            />
          )}
        </div>

        {invoice && (
          <p className="mt-6 text-center text-[11px] text-muted-foreground">
            Номер заказа для поддержки: <span className="font-mono">{invoice}</span>
          </p>
        )}
      </div>
    </main>
  );
}

function StateWrap({
  icon,
  title,
  subtitle,
  meta,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        {icon}
      </div>
      <h1 className="mt-5 font-serif text-2xl leading-tight md:text-3xl">{title}</h1>
      {subtitle && (
        <p className="mt-3 text-sm text-muted-foreground md:text-[15px]">{subtitle}</p>
      )}
      {meta}
      {action}
    </div>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary/60 p-3 text-left">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

function HomeLink() {
  return (
    <Link
      to="/"
      className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-5 py-3 text-sm font-medium hover:border-primary hover:text-primary"
    >
      На главную
    </Link>
  );
}

function EmptyState() {
  return (
    <StateWrap
      icon={<AlertTriangle className="h-7 w-7 text-destructive" />}
      title="Нет номера заказа"
      subtitle="Ссылка на эту страницу должна содержать invoice в параметрах, например /payment-success?invoice=NF-…"
      action={<HomeLink />}
    />
  );
}

function PaymentMethodDetails({ order }: { order: OrderStatusResult }) {
  const info = getPaymentMethod(order.paymentMethod);
  if (!info) return null;
  const parts =
    info.installments > 1 && order.amountRub
      ? splitInstallments(order.amountRub, info.installments)
      : null;
  return (
    <div className="mt-5 rounded-2xl border border-border bg-secondary/40 p-4 text-left">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
          <CreditCard className="h-4 w-4" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Способ оплаты
          </div>
          <div className="text-sm font-medium">{info.label}</div>
        </div>
        <span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-medium text-muted-foreground">
          {info.tag}
        </span>
      </div>

      {parts && (
        <div className="mt-3">
          <div className="mb-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            График платежей
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {parts.map((p, i) => (
              <div
                key={i}
                className={`rounded-lg border p-1.5 text-center ${
                  i === 0 && order.status === "paid"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border"
                }`}
              >
                <div className="text-[9px] text-muted-foreground">
                  {i === 0 ? "1-й" : `${i + 1}-й`}
                </div>
                <div className="mt-0.5 text-[11px] font-semibold">{fmt(p)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {order.transactionId && (
        <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-[11px]">
          <span className="text-muted-foreground">ID транзакции</span>
          <span className="font-mono text-foreground">
            {order.transactionId}
          </span>
        </div>
      )}
    </div>
  );
}
