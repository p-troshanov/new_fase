import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { XCircle, ArrowRight, CreditCard } from "lucide-react";
import { z } from "zod";
import { trackEvent } from "@/lib/analytics";
import { getOrderStatus, type OrderStatusResult } from "@/lib/orders.functions";
import { getPaymentMethod } from "@/lib/payment-methods";

export const Route = createFileRoute("/payment-cancel")({
  validateSearch: z.object({
    invoice: z.string().optional(),
    reason: z.string().optional(),
  }),
  head: () => ({
    meta: [
      { title: "Оплата отменена — NEW FACE" },
      { name: "description", content: "Оплата не завершена. Можно попробовать ещё раз — цена сохранится." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaymentCancelPage,
});

function PaymentCancelPage() {
  const { invoice, reason } = useSearch({ from: "/payment-cancel" });
  const check = useServerFn(getOrderStatus);
  const [order, setOrder] = useState<OrderStatusResult | null>(null);

  useEffect(() => {
    trackEvent("payment:cancel_page", { invoice, reason });
    if (!invoice) return;
    check({ data: { invoiceId: invoice } })
      .then(setOrder)
      .catch(() => {
        /* silent — страница остаётся полезной без деталей */
      });
  }, [invoice, reason, check]);

  const info = getPaymentMethod(order?.paymentMethod);

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto max-w-xl px-5 pt-16 pb-24 md:pt-24">
        <Link to="/" className="inline-block">
          <div className="font-serif text-xl tracking-[0.28em]">NEW FACE</div>
          <div className="mt-1.5 text-[10px] tracking-[0.32em] uppercase text-muted-foreground">
            Natural Face Method
          </div>
        </Link>

        <div className="mt-12 rounded-3xl border border-border bg-card p-8 md:p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="mt-5 font-serif text-2xl leading-tight md:text-3xl">
            Оплата не завершена
          </h1>
          <p className="mt-3 text-sm text-muted-foreground md:text-[15px]">
            {reason
              ? `Причина: ${reason}. `
              : info
                ? `${info.failedHint} `
                : "Платёж был отменён или прерван. "}
            С карты деньги не списаны. Цена и скидка сохранятся — можно попробовать ещё раз.
          </p>

          {info && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-border bg-secondary/40 px-4 py-2 text-xs">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Способ оплаты:</span>
              <b className="text-foreground">{info.label}</b>
              <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {info.tag}
              </span>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2">
            <Link
              to="/course"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-medium text-primary-foreground hover:brightness-105"
            >
              Вернуться к оформлению
              <ArrowRight className="h-4 w-4" />
            </Link>
            {invoice && (
              <Link
                to="/payment-success"
                search={{ invoice }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-5 py-3 text-sm font-medium hover:border-primary hover:text-primary"
              >
                Проверить статус заказа
              </Link>
            )}
            <Link
              to="/contacts"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-5 py-3 text-sm font-medium hover:border-primary hover:text-primary"
            >
              Написать в поддержку
            </Link>
          </div>

          {invoice && (
            <p className="mt-6 text-[11px] text-muted-foreground">
              Номер заказа: <span className="font-mono">{invoice}</span>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
