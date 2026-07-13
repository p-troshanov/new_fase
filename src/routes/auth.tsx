import { createFileRoute, useNavigate, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Вход и регистрация — NEW FACE" },
      { name: "description", content: "Войдите в личный кабинет NEW FACE или зарегистрируйтесь, чтобы отслеживать заказы и материалы." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/account" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await router.invalidate();
        navigate({ to: "/account" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/account",
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        setInfo("Готово! Проверьте почту для подтверждения адреса, затем войдите.");
        setMode("signin");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Что-то пошло не так");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-foreground mb-8">
          ← На главную
        </Link>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-foreground text-center">
            {mode === "signin" ? "Вход в кабинет" : "Регистрация"}
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {mode === "signin"
              ? "Введите email и пароль от аккаунта."
              : "Создайте аккаунт, чтобы отслеживать заказы и доступ к материалам."}
          </p>

          <div className="mt-6 flex rounded-xl border border-border bg-secondary/30 p-1 text-sm">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-lg py-2 transition ${mode === "signin" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              Вход
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-lg py-2 transition ${mode === "signup" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Имя</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder="Как к вам обращаться"
                />
              </div>
            )}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Пароль</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>
            )}
            {info && (
              <div className="rounded-xl bg-primary/10 px-3 py-2 text-xs text-primary">{info}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-primary py-3 text-sm font-medium text-primary-foreground transition hover:brightness-105 disabled:opacity-60"
            >
              {loading ? "Загрузка…" : mode === "signin" ? "Войти" : "Создать аккаунт"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
