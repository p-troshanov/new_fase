import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMyOrders } from "@/lib/account.functions";

export const Route = createFileRoute("/_authenticated/account/materials")({
  component: MaterialsPage,
});

function MaterialsPage() {
  const fetchOrders = useServerFn(getMyOrders);
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => fetchOrders(),
  });

  const paid = (data ?? []).filter((o) => o.status === "paid");
  const hasCourse = paid.some((o) => o.offer_key?.includes("course"));
  const hasIntensive = paid.some((o) => o.offer_key?.includes("intensive"));

  if (isLoading) return <p className="text-sm text-muted-foreground">Загрузка…</p>;

  if (paid.length === 0)
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          У вас пока нет оплаченных материалов.
        </p>
        <div className="mt-4 flex gap-2 justify-center">
          <Link to="/course" className="text-sm text-primary underline">
            Курс
          </Link>
          <Link to="/intensive" className="text-sm text-primary underline">
            Интенсив
          </Link>
        </div>
      </div>
    );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {hasCourse && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold">Полный курс NEW FACE</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Доступ к урокам и материалам курса.
          </p>
          <Link to="/lesson" className="mt-4 inline-block text-sm text-primary underline">
            Открыть →
          </Link>
        </div>
      )}
      {hasIntensive && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold">Интенсив</h3>
          <p className="mt-2 text-sm text-muted-foreground">Материалы интенсива.</p>
          <Link to="/intensive" className="mt-4 inline-block text-sm text-primary underline">
            Открыть →
          </Link>
        </div>
      )}
    </div>
  );
}
