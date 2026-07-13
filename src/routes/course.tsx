import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { z } from "zod";
import {
  Check,
  ArrowRight,
  Sparkles,
  MessageCircle,
  Video,
  BookOpen,
  Users,
  Clock,
  Shield,
  Plus,
} from "lucide-react";
import courseHero from "@/assets/course-hero.jpg";
import { CountdownTimer } from "@/components/sales/CountdownTimer";
import { ExitIntentModal } from "@/components/sales/ExitIntentModal";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";
import { PaymentMethods } from "@/components/checkout/PaymentMethods";
import type { ProductKey } from "@/lib/products";

const searchSchema = z.object({
  offer: z.enum(["first", "returning", "exit"]).optional(),
  wheel: z.coerce.number().int().min(1).max(99).optional(),
});

// Central pricing config — one source of truth for course discounts.
const COURSE_FULL_PRICE = 9900;
const COURSE_OFFERS: Record<string, { price: number; label: string }> = {
  first: { price: 2990, label: "−40% первый заказ" },
  exit: { price: 2690, label: "−46% последнее предложение" },
  returning: { price: 3490, label: "−30% для возвращающихся" },
};
const COURSE_DEFAULT = { price: 4990, label: "−50% до конца недели" };

export const Route = createFileRoute("/course")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Полный курс NEW FACE — Natural Face Method за 21 день" },
      {
        name: "description",
        content:
          "12 уроков массажа лица NEW FACE: лимфодренаж, скульптурирование, работа с шеей и осанкой. Обратная связь, PDF-материалы, доступ навсегда.",
      },
      { property: "og:title", content: "Полный курс NEW FACE" },
      {
        property: "og:description",
        content:
          "12 уроков, работа со всеми зонами лица. Ощутимый результат за 21 день по 7 минут в день.",
      },
      { property: "og:type", content: "product" },
      { property: "og:url", content: "https://new-face-course.lovable.app/course" },
    ],
    links: [{ rel: "canonical", href: "https://new-face-course.lovable.app/course" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Полный курс NEW FACE",
          description:
            "12 видеоуроков самомассажа лица: лимфодренаж, скульптурирование, работа с шеей и осанкой. PDF-материалы, обратная связь, доступ навсегда.",
          brand: { "@type": "Brand", name: "NEW FACE" },
          url: "https://new-face-course.lovable.app/course",
          offers: {
            "@type": "Offer",
            price: String(COURSE_DEFAULT.price),
            priceCurrency: "RUB",
            availability: "https://schema.org/InStock",
            url: "https://new-face-course.lovable.app/course",
          },
        }),
      },
    ],
  }),
  component: CoursePage,
});

const modules = [
  { n: "01", title: "Утренний ритуал", desc: "Основа метода — 7 минут для сияния." },
  { n: "02", title: "Лимфодренаж", desc: "Убираем отёки и застой жидкости." },
  { n: "03", title: "Работа со лбом", desc: "Разглаживаем горизонтальные заломы." },
  { n: "04", title: "Зона глаз", desc: "Мягкий уход за самой тонкой кожей." },
  { n: "05", title: "Скулы и щёки", desc: "Скульптурирование и лифтинг." },
  { n: "06", title: "Носогубный треугольник", desc: "Работа со складками и уголками рта." },
  { n: "07", title: "Овал лица", desc: "Возвращаем чёткий контур." },
  { n: "08", title: "Шея и декольте", desc: "Продолжение молодости лица." },
  { n: "09", title: "Осанка и напряжение", desc: "Снимаем зажимы, которые старят." },
  { n: "10", title: "Буккальный массаж", desc: "Внутренняя проработка щёк." },
  { n: "11", title: "Вечерняя разгрузка", desc: "Массаж для восстановления." },
  { n: "12", title: "Ваша ежедневная программа", desc: "Собираем ритуал под ваши цели." },
];

const includes = [
  { icon: Video, title: "12 видеоуроков", sub: "HD-качество, доступ навсегда" },
  { icon: BookOpen, title: "PDF-материалы", sub: "Схемы, чек-листы, дневник" },
  { icon: MessageCircle, title: "Обратная связь", sub: "Разбор техники по видео" },
  { icon: Users, title: "Закрытое сообщество", sub: "Поддержка и вопросы" },
  { icon: Clock, title: "7 минут в день", sub: "Программа встроится в утро" },
  { icon: Shield, title: "Гарантия 14 дней", sub: "Вернём деньги без вопросов" },
];

const BUMP_PRICE = 490;

function CoursePage() {
  const { offer, wheel } = Route.useSearch();
  const [bump, setBump] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  useEffect(() => {
    trackEvent("view:course", { offer: offer ?? null, wheel: wheel ?? null });
  }, [offer, wheel]);

  const hasWheel = typeof wheel === "number" && wheel >= 1 && wheel <= 99;
  const oldPrice = COURSE_FULL_PRICE;
  const offerCfg = offer ? COURSE_OFFERS[offer] : null;
  const basePrice = hasWheel
    ? Math.max(190, Math.round((oldPrice * (100 - wheel!)) / 100 / 10) * 10)
    : offerCfg?.price ?? COURSE_DEFAULT.price;
  const discountLabel = hasWheel
    ? `Колесо фортуны · −${wheel}%`
    : offerCfg?.label ?? COURSE_DEFAULT.label;
  const isFirst = offer === "first";
  const showCountdown = hasWheel || Boolean(offerCfg);
  const total = basePrice + (bump ? BUMP_PRICE : 0);
  const fmt = (n: number) => n.toLocaleString("ru-RU").replace(",", " ") + " ₽";

  return (
    <>
    <main className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto max-w-6xl px-5 pt-8 pb-20 md:px-10 md:pt-12">
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
            to="/lesson"
            search={{}}
            className="text-xs text-muted-foreground hover:text-foreground md:text-sm"
          >
            ← К бесплатному уроку
          </Link>
        </div>

        {/* Hero */}
        <section className="mt-10 grid gap-10 md:mt-14 md:grid-cols-[1.05fr_1fr] md:items-center md:gap-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
              {hasWheel
                ? `Приз колеса фортуны · −${wheel}%`
                : offer === "exit"
                ? "Последнее предложение · −46%"
                : offer === "returning"
                ? "Возвращающимся · −30%"
                : isFirst
                ? "Персональное предложение · −40%"
                : "Полный курс · 12 уроков"}
            </span>
            <h1 className="mt-5 font-serif text-[42px] leading-[1.03] tracking-tight md:text-[64px]">
              Метод, который делает лицо{" "}
              <span className="italic text-primary">отдохнувшим</span> за 21 день.
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground md:text-base">
              NEW FACE — авторская система натурального массажа лица. Работа со всеми зонами:
              лимфа, скулы, шея, осанка. Никаких инструментов и косметологии — только руки
              и 7 минут в день.
            </p>

            <div className="mt-8 flex flex-wrap items-baseline gap-4">
              <div className="font-serif text-4xl md:text-5xl">{fmt(basePrice)}</div>
              <div className="text-sm text-muted-foreground line-through">{fmt(oldPrice)}</div>
              <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                {discountLabel}
              </span>
            </div>

            {hasWheel ? (
              <div className="mt-5">
                <CountdownTimer
                  storageKey="wheel-prize"
                  durationMs={30 * 60 * 1000}
                  label="Приз колеса сгорит через"
                />
              </div>
            ) : offer === "exit" ? (
              <div className="mt-5">
                <CountdownTimer
                  storageKey="exit-course"
                  durationMs={30 * 60 * 1000}
                  label="Специальная цена действует"
                />
              </div>
            ) : showCountdown ? (
              <div className="mt-5">
                <CountdownTimer
                  storageKey="first-order"
                  label="Персональная цена сгорит через"
                />
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#buy"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-4 text-[15px] font-medium text-primary-foreground transition hover:brightness-105"
              >
                Забрать курс
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </a>
              <a
                href="#program"
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-7 py-4 text-[15px] font-medium text-foreground transition hover:bg-secondary"
              >
                Смотреть программу
              </a>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-secondary md:rounded-[2rem]">
            <img
              src={courseHero}
              alt="Полный курс NEW FACE"
              width={1600}
              height={1024}
              className="h-full max-h-[560px] w-full object-cover"
            />
          </div>
        </section>

        {/* Includes */}
        <section className="mt-16 md:mt-24">
          <h2 className="max-w-2xl font-serif text-3xl leading-tight md:text-4xl">
            Что входит в курс
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
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
            Программа · 12 уроков
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
            Каждый урок — короткая теория и практика по 7–12 минут. Идите последовательно
            или собирайте ритуал под свою задачу.
          </p>

          <div className="mt-8 grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-2">
            {modules.map((m) => (
              <div key={m.n} className="flex gap-5 bg-card px-6 py-5">
                <div className="font-serif text-2xl text-primary md:text-3xl">{m.n}</div>
                <div>
                  <div className="text-[15px] font-semibold">{m.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonial */}
        <section className="mt-16 rounded-3xl bg-secondary/70 p-8 md:mt-24 md:p-14">
          <div className="mx-auto max-w-3xl text-center">
            <div className="font-serif text-2xl leading-snug md:text-3xl">
              «Через две недели я перестала пользоваться тональником по утрам —
              лицо выглядит отдохнувшим само по себе.»
            </div>
            <div className="mt-6 text-sm text-muted-foreground">Анна, 38 лет · выпускница потока</div>
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
                Начните курс сегодня
              </h2>
              <ul className="mt-6 space-y-3 text-sm md:text-[15px]">
                {[
                  "Доступ ко всем 12 урокам сразу",
                  "PDF-материалы и дневник практики",
                  "Обратная связь и закрытое сообщество",
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
                Полный курс NEW FACE
              </div>
              <div className="mt-3 flex items-baseline gap-3">
                <div className="font-serif text-5xl">{fmt(basePrice)}</div>
                <div className="text-sm text-muted-foreground line-through">{fmt(oldPrice)}</div>
              </div>

              {/* Order bump */}
              <label
                htmlFor="bump"
                className={`mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                  bump
                    ? "border-primary bg-primary/5"
                    : "border-border bg-secondary/40 hover:border-primary/50"
                }`}
              >
                <input
                  id="bump"
                  type="checkbox"
                  checked={bump}
                  onChange={(e) => setBump(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-primary"
                />
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                      <Plus className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
                      Персональный разбор техники
                    </div>
                    <div className="text-sm font-medium">+{fmt(BUMP_PRICE)}</div>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Пришлёте видео практики — эксперт запишет разбор с правками именно для вас.
                  </p>
                </div>
              </label>

              <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4">
                <div className="text-sm text-muted-foreground">К оплате</div>
                <div className="font-serif text-3xl">{fmt(total)}</div>
              </div>

              <button
                type="button"
                onClick={() => {
                  trackEvent("checkout:start", {
                    product: "course",
                    offer,
                    wheel,
                    bump,
                    total,
                  });
                  setCheckoutOpen(true);
                }}
                className="mt-5 w-full rounded-2xl bg-primary py-4 text-[15px] font-medium text-primary-foreground transition hover:brightness-105"
              >
                Оплатить и начать
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Безопасная оплата · чек по 54-ФЗ · доступ сразу после платежа
              </p>
              <div className="mt-4">
                <PaymentMethods variant="compact" price={total} />
              </div>
            </div>
          </div>
        </section>

        {/* Bridge to tripwire */}
        <section className="mt-10 rounded-3xl border border-border bg-card p-7 md:p-10">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                Ещё сомневаетесь?
              </div>
              <h3 className="mt-3 font-serif text-2xl leading-tight md:text-3xl">
                Попробуйте 7-дневный интенсив против отёков за 590 ₽
              </h3>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-[15px]">
                За неделю увидите, как работает метод. Сумму зачтём при переходе на полный курс.
              </p>
            </div>
            <Link
              to="/intensive"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-6 py-3.5 text-sm font-medium transition hover:border-primary hover:text-primary"
            >
              Смотреть интенсив
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
        </section>

        <footer className="mt-16 flex flex-col items-center gap-2 text-xs text-muted-foreground">
          <div>© NEW FACE · Natural Face Method</div>
          <div className="flex gap-4">
            <Link to="/offer" className="hover:text-foreground">Оферта</Link>
            <Link to="/privacy" className="hover:text-foreground">Конфиденциальность</Link>
            <Link to="/contacts" className="hover:text-foreground">Контакты</Link>
          </div>
        </footer>
      </div>
    </main>
    <ExitIntentModal />
    <CheckoutModal
      open={checkoutOpen}
      onClose={() => setCheckoutOpen(false)}
      title="Полный курс NEW FACE"
      offerKey={hasWheel ? `wheel-${wheel}` : offer ?? "default"}
      source="course_page"
      items={[
        {
          product: (offer === "first"
            ? "course_first"
            : offer === "exit"
            ? "course_exit"
            : offer === "returning"
            ? "course_returning"
            : "course_default") as ProductKey,
          quantity: 1,
        },
        ...(bump ? [{ product: "bump_pdf" as ProductKey, quantity: 1 }] : []),
      ]}
    />
    </>
  );
}
