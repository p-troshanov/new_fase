import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "Личный кабинет — NEW FACE" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AccountLayout,
});

function AccountLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const tabs = [
    { to: "/account", label: "Профиль" },
    { to: "/account/orders", label: "Мои заказы" },
    { to: "/account/materials", label: "Материалы" },
  ] as const;
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-sm font-semibold tracking-wide text-foreground">
            NEW FACE
          </Link>
          <SignOutButton />
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-foreground">Личный кабинет</h1>
        <nav className="mt-6 flex gap-1 border-b border-border overflow-x-auto">
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
                {t.label}
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

function SignOutButton() {
  return (
    <button
      onClick={async () => {
        const { supabase } = await import("@/integrations/supabase/client");
        await supabase.auth.signOut();
        window.location.href = "/";
      }}
      className="text-xs text-muted-foreground hover:text-foreground"
    >
      Выйти
    </button>
  );
}
