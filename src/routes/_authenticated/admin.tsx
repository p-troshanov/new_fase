import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { adminLeadStats } from "@/lib/admin.functions";


export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw redirect({ to: "/auth" });
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (error || !data) throw redirect({ to: "/account" });
  },
  head: () => ({
    meta: [
      { title: "Админка — NEW FACE" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const stats = useServerFn(adminLeadStats);
  const { data: leadStats } = useQuery({
    queryKey: ["admin-lead-stats"],
    queryFn: () => stats(),
    refetchInterval: 60_000,
  });
  const newLeads = leadStats?.newCount ?? 0;
  const tabs = [
    { to: "/admin", label: "Обзор", badge: 0 },
    { to: "/admin/orders", label: "Заказы", badge: 0 },
    { to: "/admin/leads", label: "Лиды", badge: newLeads },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-semibold">NEW FACE</Link>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">admin</span>
          </div>
          <Link to="/account" className="text-xs text-muted-foreground hover:text-foreground">
            Мой кабинет →
          </Link>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="flex gap-1 border-b border-border">
          {tabs.map((t) => {
            const active = pathname === t.to;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`px-4 py-2 text-sm border-b-2 -mb-px transition ${
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {t.label}
                  {t.badge > 0 && (
                    <span className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                      {t.badge}
                    </span>
                  )}
                </span>
              </Link>

            );
          })}
        </nav>
        <div className="pt-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
