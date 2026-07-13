import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Check, PlayCircle, FileText, Send, ArrowRight, Sparkles, Gift } from "lucide-react";
import { TELEGRAM_URL } from "@/components/quiz/TelegramCTA";
import { trackEvent } from "@/lib/analytics";
import { CountdownTimer } from "@/components/sales/CountdownTimer";

type StoredAnswers = {
  source?: string;
  name?: string;
  ts?: number;
  answers?: Record<string, unknown>;
};

function readStoredAnswers(): StoredAnswers | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("newface:answers");
    return raw ? (JSON.parse(raw) as StoredAnswers) : null;
  } catch {
    return null;
  }
}

/**
 * Extracts a primary concern signal from the quiz answers to further personalize
 * the /thanks headline (e.g. puffiness → intensive nudge; sagging → full course).
 */
function extractConcern(a?: Record<string, unknown>): string | null {
  if (!a) return null;
  const flat = JSON.stringify(a).toLowerCase();
  if (flat.includes("отёк") || flat.includes("отек") || flat.includes("puff")) return "puffiness";
  if (flat.includes("овал") || flat.includes("контур") || flat.includes("sag")) return "oval";
  if (flat.includes("морщин") || flat.includes("wrinkle")) return "wrinkles";
  if (flat.includes("тон") || flat.includes("dull") || flat.includes("сер")) return "tone";
  return null;
}


export const Route = createFileRoute("/thanks")({
  validateSearch: z.object({
    name: z.string().trim().max(100).optional(),
    source: z.string().trim().max(80).optional(),
  }),
  head: () => ({
    meta: [
      { title: "Спасибо! Ваш стартовый набор NEW FACE готов" },
      {
        name: "description",
        content:
          "Получите видеоурок, PDF-инструкцию и доступ в закрытый Telegram-канал NEW FACE.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ThanksPage,
});

/**
 * Message personalized by the lead source (which quiz/magnet was completed).
 */
function personalize(source?: string): { headline: string; sub: string } {
  const s = source ?? "";
  if (s.includes("face_age") || s.includes("age")) {
    return {
      headline: "Готов ваш план по «face age»",
      sub: "Вы прошли диагностику возраста лица. Ниже — стартовый набор с упражнениями, которые работают именно с вашими зонами.",
    };
  }
  if (s.includes("diagnostic") || s.includes("quiz")) {
    return {
      headline: "Ваш персональный план готов",
      sub: "По ответам квиза мы подобрали для вас утренний ритуал и материалы. Начните с видеоурока — 7 минут.",
    };
  }
  if (s.includes("builder") || s.includes("ritual")) {
    return {
      headline: "Ваш утренний ритуал сохранён",
      sub: "Мы отправим напоминания и материалы. А пока — соберите базовый набор: видео, PDF и Telegram.",
    };
  }
  if (s.includes("tracker")) {
    return {
      headline: "Трекер запущен — а теперь материалы",
      sub: "Чтобы дойти до 14 дня, нужны короткие видео и PDF-схемы. Всё уже готово ниже.",
    };
  }
  return {
    headline: "Ваш стартовый набор готов",
    sub: "Всё бесплатно и доступно прямо сейчас — выберите, с чего начать.",
  };
}

function ThanksPage() {
  const { name, source } = Route.useSearch();
  const [concern, setConcern] = useState<string | null>(null);

  const base = personalize(source);
  const concernBanner =
    concern === "puffiness"
      ? "Ваш главный запрос — отёки. Начните с интенсива против отёков — за 7 дней увидите разницу."
      : concern === "oval"
      ? "Вам важен контур и овал лица — в полном курсе есть отдельный модуль по скульптурированию."
      : concern === "wrinkles"
      ? "Вы отметили морщины — в курсе разбираем работу со лбом, зоной глаз и носогубками."
      : concern === "tone"
      ? "Вам важно вернуть свежесть и тон кожи — утренний ритуал даст быстрый визуальный эффект."
      : null;

  useEffect(() => {
    const stored = readStoredAnswers();
    const c = extractConcern(stored?.answers);
    setConcern(c);
    trackEvent("view:thanks", { source: source ?? null, concern: c }, source);
  }, [source]);

  const cards = [
    {
      icon: PlayCircle,
      title: "Смотреть видеоурок",
      sub: "7 минут утренней практики с экспертом",
      to: "/lesson" as const,
      href: null,
      cta: "Открыть урок",
    },
    {
      icon: FileText,
      title: "Скачать PDF-инструкцию",
      sub: "Схемы движений и чек-лист на 7 дней",
      to: "/lesson" as const,
      href: null,
      cta: "Открыть PDF",
    },
    {
      icon: Send,
      title: "Перейти в Telegram",
      sub: "Закрытый канал с дополнительными уроками",
      to: null,
      href: TELEGRAM_URL,
      cta: "Открыть Telegram",
    },
  ];

  return (
    <main className="min-h-screen bg-background pb-24 font-sans text-foreground">
      <div className="mx-auto max-w-5xl px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Check className="h-10 w-10" strokeWidth={2} />
          </div>
          <h1 className="mt-8 font-serif text-[40px] leading-[1.05] tracking-tight text-foreground md:text-[56px]">
            Спасибо{name ? `, ${name}` : ""}!
          </h1>
          <div className="mt-4 font-serif text-xl text-foreground md:text-2xl">
            {base.headline}
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground md:text-base">
            {base.sub}
          </p>
          {concernBanner && (
            <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 px-5 py-4 text-sm text-foreground md:text-[15px]">
              <span className="mr-2 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
                <Sparkles className="h-3 w-3" strokeWidth={2} />
                По вашим ответам
              </span>
              {concernBanner}
            </div>
          )}
        </div>


        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {cards.map((c) => {
            const inner = (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <c.icon className="h-7 w-7" strokeWidth={1.5} />
                </div>
                <div className="mt-6 font-serif text-2xl text-foreground">
                  {c.title}
                </div>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{c.sub}</p>
                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
                  {c.cta}
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </div>
              </>
            );
            const className =
              "group flex flex-col rounded-3xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:border-primary hover:shadow-[0_24px_60px_-25px_rgba(120,80,50,0.35)]";
            return c.href ? (
              <a
                key={c.title}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {inner}
              </a>
            ) : (
              <Link key={c.title} to={c.to!} className={className}>
                {inner}
              </Link>
            );
          })}
        </div>

        {/* Personal upsell — full course −40% for first buyers */}
        <section className="mt-16 overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-secondary to-background p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-[1.15fr_1fr] md:items-center md:gap-12">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
                <Gift className="h-3.5 w-3.5" strokeWidth={2} />
                Только для новых участниц
              </span>
              <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
                Полный курс{" "}
                <span className="italic text-primary">NEW FACE</span>{" "}
                со скидкой −40%
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                12 уроков, все зоны лица и шеи, PDF-материалы и обратная связь.
                Спецпредложение действует только для тех, кто только что забрал
                стартовый набор.
              </p>

              <div className="mt-6 flex flex-wrap items-baseline gap-4">
                <div className="font-serif text-4xl text-foreground md:text-5xl">
                  2 990 ₽
                </div>
                <div className="text-sm text-muted-foreground line-through">
                  4 990 ₽
                </div>
              </div>

              <div className="mt-5">
                <CountdownTimer
                  storageKey="first-order"
                  label="Персональная цена сгорит через"
                />
              </div>

              <Link
                to="/course"
                search={{ offer: "first" }}
                className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-4 text-[15px] font-medium text-primary-foreground transition hover:brightness-105"
              >
                Забрать курс со скидкой
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </div>

            <ul className="space-y-3 rounded-2xl bg-card/70 p-6 text-sm md:text-[15px]">
              {[
                "12 видеоуроков, доступ навсегда",
                "PDF-материалы, схемы и дневник",
                "Разбор техники экспертом по видео",
                "Закрытое сообщество участниц",
                "Гарантия возврата 14 дней",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-none text-primary" strokeWidth={2} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Bridge / tripwire */}
        <section className="mt-8 rounded-3xl border border-border bg-card p-7 md:p-10">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                Не готовы к полному курсу?
              </div>
              <h3 className="mt-3 font-serif text-2xl leading-tight md:text-3xl">
                Начните с 7-дневного интенсива против отёков — 590 ₽
              </h3>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-[15px]">
                7 коротких уроков и дневник — за неделю увидите, как работает метод, и решите,
                идти ли дальше.
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

        <div className="mx-auto mt-14 max-w-2xl rounded-3xl bg-secondary/60 p-7 text-center md:p-10">
          <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            <Sparkles className="mr-2 inline h-3 w-3" strokeWidth={2} />
            Что дальше
          </div>
          <h2 className="mt-3 font-serif text-2xl text-foreground md:text-3xl">
            Дополнительные рекомендации — в ближайшие дни
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
            В течение недели пришлём короткие уроки, разбор популярных ошибок и
            приглашение в закрытый Telegram-канал, где эксперт отвечает на
            вопросы участниц метода NEW FACE.
          </p>
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/"
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    </main>
  );
}
