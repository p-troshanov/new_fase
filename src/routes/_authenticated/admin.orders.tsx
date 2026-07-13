import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminListOrders, adminUpdateOrderStatus } from "@/lib/admin.functions";
import { getPaymentMethod } from "@/lib/payment-methods";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: AdminOrders,
});

const STATUSES = ["all", "pending", "paid", "failed", "cancelled", "refunded"] as const;
const MUTABLE_STATUSES = ["pending", "paid", "failed", "cancelled", "refunded"] as const;

function AdminOrders() {
  const list = useServerFn(adminListOrders);
  const update = useServerFn(adminUpdateOrderStatus);
  const qc = useQueryClient();

  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", status, search],
    queryFn: () => list({ data: { status, search } }),
  });

  function exportCsv() {
    const rows = data ?? [];
    const header = ["invoice_id", "email", "name", "amount", "status", "method", "created_at"];
    const csv = [
      header.join(","),
      ...rows.map((r) =>
        [
          r.invoice_id,
          r.email,
          r.name ?? "",
          (r.amount_kopecks ?? 0) / 100,
          r.status,
          r.payment_method ?? "",
          r.created_at,
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onChangeStatus(id: string, next: string) {
    await update({ data: { id, status: next } });
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          placeholder="Поиск по email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[220px] rounded-xl border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={exportCsv}
          className="rounded-xl border border-border px-3 py-2 text-sm hover:bg-secondary/60"
        >
          Экспорт CSV
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Загрузка…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2">Дата</th>
                <th className="text-left px-3 py-2">Email</th>
                <th className="text-left px-3 py-2">Оффер</th>
                <th className="text-right px-3 py-2">Сумма</th>
                <th className="text-left px-3 py-2">Метод</th>
                <th className="text-left px-3 py-2">Статус</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="px-3 py-2 whitespace-nowrap">
                    {new Date(o.created_at).toLocaleString("ru-RU")}
                  </td>
                  <td className="px-3 py-2">{o.email}</td>
                  <td className="px-3 py-2 text-muted-foreground">{o.offer_key}</td>
                  <td className="px-3 py-2 text-right">
                    {new Intl.NumberFormat("ru-RU").format((o.amount_kopecks ?? 0) / 100)} ₽
                  </td>
                  <td className="px-3 py-2">
                    {o.payment_method ? getPaymentMethod(o.payment_method)?.label ?? o.payment_method : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={o.status}
                      onChange={(e) => onChangeStatus(o.id, e.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
                    >
                      {MUTABLE_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {(data ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                    Ничего не найдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
