import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminFunnelSummary } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const fetch = useServerFn(adminFunnelSummary);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-funnel"],
    queryFn: () => fetch(),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Заказов всего" value={data.orders.total} />
        <Stat label="Оплачено" value={data.orders.paid} tone="success" />
        <Stat label="Ожидают" value={data.orders.pending} tone="warn" />
        <Stat label="Лидов" value={data.leads} />
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">События воронки</h3>
        {Object.keys(data.events).length === 0 ? (
          <p className="text-sm text-muted-foreground">Пока нет событий.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {Object.entries(data.events)
              .sort((a, b) => b[1] - a[1])
              .map(([k, v]) => (
                <li key={k} className="flex justify-between border-b border-border py-1.5">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium">{v}</span>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "success" | "warn" }) {
  const toneClass =
    tone === "success"
      ? "text-emerald-600"
      : tone === "warn"
        ? "text-amber-600"
        : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-3xl font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}
