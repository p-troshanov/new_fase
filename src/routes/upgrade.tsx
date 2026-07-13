import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Check, ArrowRight, Sparkles, Gift } from "lucide-react";
import { CountdownTimer } from "@/components/sales/CountdownTimer";
import { trackEvent } from "@/lib/analytics";
import courseHero from "@/assets/course-hero.jpg";

export const Route = createFileRoute("/upgrade")({
  head: () => ({
    meta: [
      { title: "Апгрейд до полного курса NEW FACE — засчитаем 590 ₽" },
      {
        name: "description",
        content:
          "Продолжите с полным курсом NEW FACE. Стоимость 7-дневного интенсива засчитываем в оплату — вы платите только разницу.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UpgradePage,
});

function UpgradePage() {
  const intensivePaid = 590;
  const fullPrice = 4990;
  const upgradePrice = fullPrice - intensivePaid - 1500; // extra loyalty discount
  const fmt = (n: number) => n.toLocaleString("ru-RU").replace(",", " ") + " ₽";

  useEffect(() => {
    trackEvent("view:upgrade", { price: upgradePrice });
  }, [upgradePrice]);


  return (
    <main className="min-h-screen bg-background pb-24 font-sans text-foreground">
      <div className="mx-auto max-w-5xl px-5 py-14 md:px-10 md:py-20">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-block">
            <div className="font-serif text-xl tracking-[0.28em] leading-none md:text-2xl">
              NEW FACE
            </div>
            <div className="mt-1.5 text-[10px] tracking-[0.32em] uppercase text-muted-foreground">
              Natural Face Method
            </div>
          </Link>
          <Link
            to="/intensive"
            className="text-xs text-muted-foreground hover:text-foreground md:text-sm"
          >
            ← К интенсиву
          </Link>
        </div>

        <section className="mt-12 grid gap-10 md:mt-16 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
              <Gift className="h-3.5 w-3.5" strokeWidth={2} />
              Апгрейд для участниц интенсива
            </span>
            <h1 className="mt-5 font-serif text-[40px] leading-[1.05] tracking-tight md:text-[56px]">
              Ваши 590 ₽{" "}
              <span className="italic text-primary">засчитываем</span> в полный курс
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground md:text-base">
              За неделю интенсива вы увидели, как работает метод. Теперь можно перейти к
              полной программе — со всеми зонами лица, шеи и осанки — и доплатить только
              разницу.
            </p>

            <div className="mt-8 rounded-3xl border border-border bg-card p-6">
              <div className="space-y-2 text-sm">
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground">Полный курс NEW FACE</span>
                  <span>{fmt(fullPrice)}</span>
                </div>
                <div className="flex items-baseline justify-between text-primary">
                  <span>− Ваша оплата за интенсив</span>
                  <span>−{fmt(intensivePaid)}</span>
                </div>
                <div className="flex items-baseline justify-between text-primary">
                  <span>− Бонус для участниц интенсива</span>
                  <span>−1 500 ₽</span>
                </div>
                <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4 text-base">
                  <span className="font-medium">К оплате</span>
                  <span className="font-serif text-3xl md:text-4xl">{fmt(upgradePrice)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <CountdownTimer
                storageKey="upgrade"
                label="Апгрейд-цена сохранится ещё"
              />
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  trackEvent("checkout:start", { product: "upgrade", total: upgradePrice })
                }
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-4 text-[15px] font-medium text-primary-foreground transition hover:brightness-105"
              >
                Оформить апгрейд
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </button>
              <Link
                to="/course"
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-4 text-sm font-medium transition hover:border-primary hover:text-primary"
              >
                Смотреть полный курс
              </Link>
            </div>

            <ul className="mt-8 space-y-2 text-sm text-muted-foreground">
              {[
                "12 уроков + всё, что уже открыто в интенсиве",
                "PDF-материалы и дневник практики",
                "Обратная связь и закрытое сообщество",
                "Гарантия возврата 14 дней",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-primary" strokeWidth={2} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-secondary md:rounded-[2rem]">
            <img
              src={courseHero}
              alt="Полный курс NEW FACE"
              width={1600}
              height={1024}
              className="h-full max-h-[560px] w-full object-cover"
            />
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-background/85 p-4 backdrop-blur">
              <div className="flex items-center gap-2 text-xs text-primary">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                Персональное предложение
              </div>
              <div className="mt-1 font-serif text-2xl">
                {fmt(upgradePrice)}{" "}
                <span className="text-sm text-muted-foreground line-through">{fmt(fullPrice)}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
