import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMyOrders } from "@/lib/account.functions";
import { getPaymentMethod } from "@/lib/payment-methods";

export const Route = createFileRoute("/_authenticated/account/orders")({
  component: OrdersPage,
});

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: "Ожидает оплаты", className: "bg-amber-500/10 text-amber-600" },
  paid: { label: "Оплачен", className: "bg-emerald-500/10 text-emerald-600" },
  failed: { label: "Отклонён", className: "bg-red-500/10 text-red-600" },
  cancelled: { label: "Отменён", className: "bg-muted text-muted-foreground" },
  refunded: { label: "Возврат", className: "bg-blue-500/10 text-blue-600" },
};

function OrdersPage() {
  const fetchOrders = useServerFn(getMyOrders);
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => fetchOrders(),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Загрузка заказов…</p>;
  if (!data || data.length === 0)
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">Заказов пока нет.</p>
        <Link to="/course" className="mt-3 inline-block text-sm text-primary underline">
          Посмотреть курс →
        </Link>
      </div>
    );

  return (
    <div className="space-y-3">
      {data.map((o) => {
        const status = STATUS_LABELS[o.status] ?? { label: o.status, className: "bg-muted" };
        const amount = new Intl.NumberFormat("ru-RU").format((o.amount_kopecks ?? 0) / 100);
        return (
          <Link
            key={o.id}
            to="/account/orders/$id"
            params={{ id: o.id }}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 hover:border-primary/50 transition"
          >
            <div>
              <div className="text-sm font-medium text-foreground">
                {o.offer_key ?? "Заказ"} · {amount} ₽
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(o.created_at).toLocaleString("ru-RU")} ·{" "}
                {o.payment_method ? getPaymentMethod(o.payment_method)?.label ?? o.payment_method : "Карта"}
              </div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full ${status.className}`}>
              {status.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
