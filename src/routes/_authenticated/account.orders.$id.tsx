import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMyOrder } from "@/lib/account.functions";
import { getPaymentMethod } from "@/lib/payment-methods";

export const Route = createFileRoute("/_authenticated/account/orders/$id")({
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const fetchOrder = useServerFn(getMyOrder);
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-order", id],
    queryFn: () => fetchOrder({ data: { id } }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  if (error || !data) return <p className="text-sm text-destructive">Не удалось загрузить заказ.</p>;

  const { order } = data;
  const amount = new Intl.NumberFormat("ru-RU").format((order.amount_kopecks ?? 0) / 100);

  return (
    <div className="max-w-2xl space-y-4">
      <Link to="/account/orders" className="text-xs text-muted-foreground hover:text-foreground">
        ← К списку заказов
      </Link>
      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-lg font-semibold">{order.offer_key ?? "Заказ"}</div>
            <div className="text-xs text-muted-foreground">#{order.invoice_id}</div>
          </div>
          <div className="text-2xl font-semibold">{amount} ₽</div>
        </div>
        <dl className="grid grid-cols-2 gap-y-2 text-sm pt-3 border-t border-border">
          <dt className="text-muted-foreground">Статус</dt>
          <dd>{order.status}</dd>
          <dt className="text-muted-foreground">Способ оплаты</dt>
          <dd>{order.payment_method ? getPaymentMethod(order.payment_method)?.label ?? order.payment_method : "Карта"}</dd>
          <dt className="text-muted-foreground">Создан</dt>
          <dd>{new Date(order.created_at).toLocaleString("ru-RU")}</dd>
          {order.paid_at && (
            <>
              <dt className="text-muted-foreground">Оплачен</dt>
              <dd>{new Date(order.paid_at).toLocaleString("ru-RU")}</dd>
            </>
          )}
          {order.transaction_id && (
            <>
              <dt className="text-muted-foreground">Транзакция</dt>
              <dd className="font-mono text-xs">{order.transaction_id}</dd>
            </>
          )}
        </dl>
        {(order.status === "pending" || order.status === "failed") && (
          <div className="pt-4 border-t border-border">
            <Link
              to="/course"
              className="inline-block rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Повторить оплату
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
