import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import {
  Play,
  Pause,
  Check,
  FileText,
  Send,
  Sparkles,
  ArrowRight,
  Clock,
  Heart,
  Wind,
  Sun,
} from "lucide-react";
import videoThumb from "@/assets/video-thumb.jpg";
import { CountdownTimer } from "@/components/sales/CountdownTimer";

const searchSchema = z.object({
  name: z.string().trim().max(100).optional(),
});

export const Route = createFileRoute("/lesson")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Ваш урок NEW FACE — 7-минутный утренний ритуал" },
      {
        name: "description",
        content:
          "Первый бесплатный урок метода NEW FACE. Утренний массаж лица за 7 минут — просто повторяйте за инструктором.",
      },
      { property: "og:title", content: "Ваш урок NEW FACE готов" },
      {
        property: "og:description",
        content: "Утренний массаж лица за 7 минут. Просто повторяйте за инструктором.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LessonPage,
});

function LessonPage() {
  const { name } = Route.useSearch();
  const [playing, setPlaying] = useState(false);

  const inLesson = [
    { icon: Wind, title: "Лимфодренаж", sub: "снимаем отёки и следы сна" },
    { icon: Heart, title: "Работа со скулами", sub: "мягкий лифтинг и тонус" },
    { icon: Sun, title: "Пробуждение кожи", sub: "приток крови и сияние" },
    { icon: Clock, title: "Всего 7 минут", sub: "встроится в утро без усилий" },
  ];

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto max-w-5xl px-5 pt-8 pb-16 md:px-10 md:pt-12 md:pb-20">
        {/* Logo */}
        <Link to="/" className="inline-block">
          <div className="font-serif text-xl tracking-[0.28em] leading-none text-foreground md:text-2xl">
            NEW FACE
          </div>
          <div className="mt-1.5 text-[10px] tracking-[0.32em] uppercase text-muted-foreground">
            Natural Face Method
          </div>
        </Link>

        {/* Greeting */}
        <section className="mt-10 md:mt-14">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 text-xs font-medium text-primary">
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            Доступ открыт
          </span>
          <h1 className="mt-4 font-serif text-[38px] leading-[1.05] tracking-tight md:text-[56px]">
            {name ? <>Ваш урок готов, <span className="italic text-primary">{name}</span>.</> : <>Ваш урок готов.</>}
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground md:text-base">
            Устройтесь удобно, разогрейте ладони и просто повторяйте движения за инструктором.
            Через 7 минут вы почувствуете лицо иначе.
          </p>
        </section>

        {/* Player */}
        <section className="mt-8 md:mt-10">
          <div className="relative overflow-hidden rounded-3xl bg-neutral-900 shadow-[0_30px_80px_-40px_rgba(120,80,50,0.35)]">
            <img
              src={videoThumb}
              alt="Утренний ритуал NEW FACE"
              width={1600}
              height={1024}
              className={`h-[360px] w-full object-cover transition md:h-[560px] ${
                playing ? "opacity-40 scale-[1.02]" : "opacity-95"
              }`}
            />
            {!playing && (
              <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/50" />
            )}

            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5 md:p-7">
              <span className="rounded-full bg-primary/85 px-4 py-1.5 text-xs font-medium tracking-wide text-primary-foreground backdrop-blur">
                Урок 1 из 12
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs text-white/90 backdrop-blur">
                7:12
              </span>
            </div>

            {playing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                  <Sparkles className="h-7 w-7 animate-pulse" strokeWidth={1.5} />
                </div>
                <p className="max-w-sm px-6 text-center text-sm leading-snug text-white md:text-[15px]">
                  Мы также отправили ссылку на этот урок вам на почту —
                  <br className="hidden md:block" />
                  чтобы вы могли вернуться к нему в любой момент.
                </p>
                <button
                  onClick={() => setPlaying(false)}
                  className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-xs text-white/90 hover:bg-white/10"
                >
                  <Pause className="h-3.5 w-3.5" strokeWidth={2} />
                  Свернуть
                </button>
              </div>
            ) : (
              <button
                onClick={() => setPlaying(true)}
                className="group absolute inset-0 flex flex-col items-center justify-center gap-4 text-white"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-2xl transition group-hover:scale-105">
                  <Play className="h-8 w-8 translate-x-0.5 fill-white" strokeWidth={0} />
                </div>
                <p className="text-sm text-white/95 md:text-base">Смотреть урок · 7:12</p>
              </button>
            )}
          </div>
        </section>

        {/* What's inside */}
        <section className="mt-12">
          <h2 className="font-serif text-2xl md:text-3xl">Что вы освоите за 7 минут</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {inLesson.map(({ icon: Icon, title, sub }) => (
              <div
                key={title}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-[15px] font-semibold">{title}</div>
                  <div className="mt-0.5 text-sm text-muted-foreground">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bonuses reminder */}
        <section className="mt-8 grid gap-3 rounded-3xl bg-secondary/70 p-6 md:grid-cols-2 md:p-8">
          <a
            href="#"
            className="flex items-center gap-4 rounded-2xl bg-card px-5 py-4 transition hover:bg-card/70"
          >
            <FileText className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
            <div className="flex-1">
              <div className="text-sm font-semibold">Скачать PDF-инструкцию</div>
              <div className="text-xs text-muted-foreground">Пошаговые схемы движений</div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </a>
          <a
            href="#"
            className="flex items-center gap-4 rounded-2xl bg-card px-5 py-4 transition hover:bg-card/70"
          >
            <Send className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
            <div className="flex-1">
              <div className="text-sm font-semibold">Вступить в Telegram-канал</div>
              <div className="text-xs text-muted-foreground">Полезные материалы и поддержка</div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </a>
        </section>

        {/* CTA to course */}
        <section className="mt-10 overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/15 via-secondary to-background p-8 md:p-12">
          <span className="inline-block text-[11px] tracking-[0.28em] uppercase text-primary">
            Персональное предложение · −40%
          </span>
          <h2 className="mt-3 font-serif text-3xl leading-tight md:text-4xl">
            Понравился урок? Продолжите с полным курсом{" "}
            <span className="italic">NEW FACE</span>.
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            12 уроков, работа со всеми зонами лица и шеи, разборы техник и обратная связь.
            Ощутимый результат за 21 день практики по 7 минут в день.
          </p>

          <div className="mt-6 flex flex-wrap items-baseline gap-4">
            <div className="font-serif text-3xl md:text-4xl">2 990 ₽</div>
            <div className="text-sm text-muted-foreground line-through">4 990 ₽</div>
          </div>
          <div className="mt-4">
            <CountdownTimer storageKey="first-order" label="Персональная цена сгорит через" />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/course"
              search={{ offer: "first" }}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition hover:brightness-105"
            >
              Забрать курс со скидкой
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
            <Link
              to="/intensive"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-6 py-3.5 text-sm font-medium transition hover:border-primary hover:text-primary"
            >
              Или начните с интенсива · 590 ₽
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
