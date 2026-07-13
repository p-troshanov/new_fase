import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";
import { PaymentMethods } from "@/components/checkout/PaymentMethods";
import type { ProductKey } from "@/lib/products";
import { z } from "zod";
import { trackEvent } from "@/lib/analytics";
import {
  ArrowRight,
  Check,
  Sparkles,
  Droplets,
  Calendar,
  Video,
  FileText,
  MessageCircle,
} from "lucide-react";
import intensiveHero from "@/assets/intensive-hero.jpg";
import { CountdownTimer } from "@/components/sales/CountdownTimer";
import { ExitIntentModal } from "@/components/sales/ExitIntentModal";

// Central pricing config for the intensive product.
const INTENSIVE_FULL = 1490;
const INTENSIVE_BASE = 590;      // -60% default
const INTENSIVE_LASTCALL = 390;  // exit-intent promo


export const Route = createFileRoute("/intensive")({
  validateSearch: z.object({
    promo: z.enum(["lastcall"]).optional(),
  }),
  head: () => ({
    meta: [
      { title: "7-дневный интенсив против отёков — NEW FACE" },
      {
        name: "description",
        content:
          "7 коротких видеоуроков и дневник практики. За 7 дней — заметно меньше утренних отёков, свежее и отдохнувшее лицо. Всего 590 ₽.",
      },
      { property: "og:title", content: "7-дневный интенсив против отёков NEW FACE" },
      {
        property: "og:description",
        content: "7 уроков по 5–8 минут. Убираем утренние отёки за неделю. 590 ₽.",
      },
      { property: "og:type", content: "product" },
      { property: "og:url", content: "https://new-face-course.lovable.app/intensive" },
    ],
    links: [{ rel: "canonical", href: "https://new-face-course.lovable.app/intensive" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "7-дневный интенсив NEW FACE",
          description:
            "7 коротких видеоуроков и дневник практики. За 7 дней — заметно меньше утренних отёков.",
          brand: { "@type": "Brand", name: "NEW FACE" },
          url: "https://new-face-course.lovable.app/intensive",
          offers: {
            "@type": "Offer",
            price: String(INTENSIVE_BASE),
            priceCurrency: "RUB",
            availability: "https://schema.org/InStock",
            url: "https://new-face-course.lovable.app/intensive",
          },
        }),
      },
    ],
  }),
  component: IntensivePage,
});

const days = [
  { d: "День 1", title: "Диагностика и старт", desc: "Определяем ваш тип отёков и делаем базовое утро." },
  { d: "День 2", title: "Лимфа шеи", desc: "Открываем главные пути оттока — без этого массаж не работает." },
  { d: "День 3", title: "Веки и подглазья", desc: "Мягкая техника против припухлости и синяков." },
  { d: "День 4", title: "Скулы и щёки", desc: "Убираем «оплывший» контур утром." },
  { d: "День 5", title: "Овал и подбородок", desc: "Возвращаем чёткую линию нижней трети лица." },
  { d: "День 6", title: "Ритуал 5 минут", desc: "Собираем короткий утренний протокол под себя." },
  { d: "День 7", title: "Финальное фото + план", desc: "Сравниваем «до/после» и выбираем, куда двигаться дальше." },
];

const includes = [
  { icon: Video, title: "7 видеоуроков", sub: "по 5–8 минут" },
  { icon: FileText, title: "PDF-дневник", sub: "чек-лист и трекер" },
  { icon: Calendar, title: "7-дневный план", sub: "конкретное задание на каждый день" },
  { icon: MessageCircle, title: "Ответы в чате", sub: "поддержка в Telegram" },
];

function IntensivePage() {
  const { promo } = Route.useSearch();
  const isLastcall = promo === "lastcall";
  const price = isLastcall ? INTENSIVE_LASTCALL : INTENSIVE_BASE;
  const oldPrice = INTENSIVE_FULL;
  const label = isLastcall ? "−74% последнее предложение" : "−60% для новых участниц";
  const fmt = (n: number) => n.toLocaleString("ru-RU").replace(",", " ") + " ₽";
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const productKey: ProductKey = isLastcall ? "intensive_lastcall" : "intensive";


  useEffect(() => {
    trackEvent("view:intensive", { promo: promo ?? null, price });
  }, [promo, price]);
  return (
    <>
    <main className="min-h-screen bg-background pb-24 font-sans text-foreground">
      <div className="mx-auto max-w-6xl px-5 pt-8 md:px-10 md:pt-12">
        {/* Nav */}
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
            to="/course"
            className="text-xs text-muted-foreground hover:text-foreground md:text-sm"
          >
            Полный курс →
          </Link>
        </div>

        {/* Hero */}
        <section className="mt-10 grid gap-10 md:mt-14 md:grid-cols-[1.05fr_1fr] md:items-center md:gap-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 text-xs font-medium text-primary">
              <Droplets className="h-3.5 w-3.5" strokeWidth={2} />
              Интенсив · 7 дней
            </span>
            <h1 className="mt-5 font-serif text-[40px] leading-[1.03] tracking-tight md:text-[60px]">
              Убираем утренние{" "}
              <span className="italic text-primary">отёки</span> за 7 дней.
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground md:text-base">
              Короткая программа, чтобы наглядно увидеть, как работает метод NEW FACE.
              7 уроков по 5–8 минут, PDF-дневник и конкретное задание на каждый день недели.
            </p>

            <div className="mt-8 flex flex-wrap items-baseline gap-4">
              <div className="font-serif text-4xl md:text-5xl">{fmt(price)}</div>
              <div className="text-sm text-muted-foreground line-through">{fmt(oldPrice)}</div>
              <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                {label}
              </span>
            </div>

            <div className="mt-6">
              <CountdownTimer
                storageKey={isLastcall ? "exit-intensive" : "intensive"}
                durationMs={isLastcall ? 30 * 60 * 1000 : undefined}
                label={
                  isLastcall
                    ? "Специальная цена действует"
                    : `Цена вернётся к ${fmt(oldPrice)} через`
                }
              />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#buy"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-4 text-[15px] font-medium text-primary-foreground transition hover:brightness-105"
              >
                Забрать интенсив
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </a>
              <a
                href="#program"
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-7 py-4 text-[15px] font-medium transition hover:bg-secondary"
              >
                Программа по дням
              </a>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-secondary md:rounded-[2rem]">
            <img
              src={intensiveHero}
              alt="7-дневный интенсив против отёков"
              width={1024}
              height={1024}
              className="h-full max-h-[560px] w-full object-cover"
            />
          </div>
        </section>

        {/* Includes */}
        <section className="mt-16 md:mt-24">
          <h2 className="max-w-2xl font-serif text-3xl leading-tight md:text-4xl">
            Что входит
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {includes.map(({ icon: Icon, title, sub }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6">
                <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                <div className="mt-4 text-base font-semibold">{title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Program */}
        <section id="program" className="mt-16 md:mt-24">
          <h2 className="max-w-2xl font-serif text-3xl leading-tight md:text-4xl">
            Программа по дням
          </h2>
          <div className="mt-8 grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-2">
            {days.map((m) => (
              <div key={m.d} className="flex gap-5 bg-card px-6 py-5">
                <div className="font-serif text-xl text-primary md:text-2xl">{m.d}</div>
                <div>
                  <div className="text-[15px] font-semibold">{m.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Buy */}
        <section
          id="buy"
          className="mt-16 overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/15 via-secondary to-background p-8 md:mt-24 md:p-14"
        >
          <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-14">
            <div>
              <h2 className="font-serif text-3xl leading-tight md:text-5xl">
                Начните с малого — за неделю увидите результат
              </h2>
              <ul className="mt-6 space-y-3 text-sm md:text-[15px]">
                {[
                  "7 коротких видеоуроков по 5–8 минут",
                  "PDF-дневник и трекер прогресса",
                  "Ответы эксперта в закрытом чате",
                  "Гарантия возврата 14 дней",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-none text-primary" strokeWidth={2} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-card p-8 shadow-sm">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                7-дневный интенсив
              </div>
              <div className="mt-3 flex items-baseline gap-3">
                <div className="font-serif text-5xl">{fmt(price)}</div>
                <div className="text-sm text-muted-foreground line-through">{fmt(oldPrice)}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  trackEvent("checkout:start", { product: "intensive", promo, price });
                  setCheckoutOpen(true);
                }}
                className="mt-6 w-full rounded-2xl bg-primary py-4 text-[15px] font-medium text-primary-foreground transition hover:brightness-105"
              >
                Оплатить и начать
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Безопасная оплата. Доступ откроется сразу.
              </p>
              <div className="mt-4">
                <PaymentMethods variant="compact" price={price} />
              </div>



              <div className="mt-6 rounded-2xl bg-secondary/70 p-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  <span className="font-medium">Хотите сразу полный метод?</span>
                </div>
                <p className="mt-2">
                  Полный курс NEW FACE — 12 уроков и все зоны лица.
                </p>
                <Link
                  to="/course"
                  search={{ offer: "first" }}
                  className="mt-3 inline-flex items-center gap-1.5 text-primary hover:underline"
                >
                  Смотреть курс со скидкой −40%
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-16 text-center text-xs text-muted-foreground">
          © NEW FACE · Natural Face Method
        </footer>
      </div>
    </main>
    <ExitIntentModal variant="intensive" />
    <CheckoutModal
      open={checkoutOpen}
      onClose={() => setCheckoutOpen(false)}
      title="7-дневный интенсив NEW FACE"
      offerKey={isLastcall ? "intensive-lastcall" : "intensive-default"}
      source="intensive_page"
      items={[{ product: productKey, quantity: 1 }]}
    />
    </>
  );
}
