// src/routes/index.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Check,
  Sparkles,
  PlayCircle,
  FileText,
  ClipboardCheck,
  Droplets,
  Waves,
  Heart,
  Stethoscope,
  Layers3,
  Hourglass,
  CalendarCheck,
  ArrowRight,
  Quote,
} from "lucide-react";
import expertPortrait from "@/assets/expert-portrait.jpg";
import expertMethod from "@/assets/expert-method.jpg";
import { LeadCaptureForm } from "@/components/quiz/LeadCaptureForm";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NEW FACE — бесплатный стартовый набор 7 минут" },
      {
        name: "description",
        content:
          "Заберите бесплатно: видеоурок 7 минут, PDF-инструкция и чек-лист на 7 дней. Утренний ритуал самомассажа против отёков и уставшего лица.",
      },
      {
        property: "og:title",
        content: "Бесплатный стартовый набор NEW FACE — 7 минут утром",
      },
      {
        property: "og:description",
        content:
          "Утренний ритуал самомассажа для более свежего и отдохнувшего лица. Видео + PDF + чек-лист бесплатно.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://new-face-course.lovable.app/" },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/4756989d-0158-4e34-9438-3905b4e872ac",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/4756989d-0158-4e34-9438-3905b4e872ac",
      },
    ],
    links: [{ rel: "canonical", href: "https://new-face-course.lovable.app/" }],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      {/* Nav */}
      <div className="mx-auto max-w-6xl px-5 pt-8 md:px-10 md:pt-10">
        <header className="flex items-center justify-between">
          <div>
            <div className="font-serif text-xl tracking-[0.28em] leading-none text-foreground md:text-2xl">
              NEW FACE
            </div>
            <div className="mt-1.5 text-[10px] tracking-[0.32em] uppercase text-muted-foreground">
              Natural Face Method
            </div>
          </div>
          <div className="hidden items-center gap-6 sm:flex">
            <Link
              to="/app"
              className="text-xs uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground"
            >
              Приложение
            </Link>
            <Link
              to="/course"
              className="text-xs uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground"
            >
              Полный курс
            </Link>
            <a
              href="#starter-kit"
              className="rounded-full border border-border px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-foreground transition hover:border-primary hover:text-primary"
            >
              Получить бесплатно
            </a>
          </div>
        </header>
      </div>

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl gap-10 px-5 pt-12 pb-20 md:grid-cols-[1.05fr_1fr] md:gap-16 md:px-10 md:pt-20 md:pb-28">
        <div className="flex flex-col justify-center">
          <div className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
            Бесплатный стартовый набор
          </div>
          <h1 className="mt-5 font-serif text-[42px] leading-[1.04] tracking-tight text-foreground md:text-[64px]">
            Просыпаетесь <br className="hidden md:block" />с{" "}
            <span className="italic text-primary">отёками</span> и уставшим лицом?
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground md:text-[17px]">
            7-минутный утренний ритуал самомассажа NEW FACE для более свежего и
            отдохнувшего лица. Только руки, без специальных средств и
            оборудования.
          </p>

          <ul className="mt-7 space-y-2.5 text-sm text-foreground/85">
            {[
              "Подходит для любого возраста",
              "Только руки — без роликов и массажёров",
              "Без специальных косметических средств",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <Check className="h-4 w-4 text-primary" strokeWidth={2} />
                {t}
              </li>
            ))}
          </ul>

          <a
            href="#starter-kit"
            className="mt-9 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-[15px] font-medium text-primary-foreground shadow-[0_20px_45px_-20px_rgba(155,110,75,0.55)] transition hover:brightness-105 sm:w-auto"
          >
            Получить бесплатно
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </a>
          <p className="mt-4 max-w-md text-xs leading-relaxed text-muted-foreground">
            В подарок: видеоурок 7 минут, PDF-инструкция со схемами движений и
            чек-лист на первые 7 дней.
          </p>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-[2rem] bg-secondary shadow-[0_40px_80px_-40px_rgba(120,80,50,0.4)]">
            <img
              src={expertPortrait}
              alt="Елена Миронова — эксперт метода NEW FACE"
              width={1024}
              height={1408}
              className="h-[560px] w-full object-cover md:h-[680px]"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-border bg-card px-5 py-4 shadow-[0_20px_45px_-20px_rgba(120,80,50,0.35)] md:block">
            <div className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              Утренний ритуал
            </div>
            <div className="mt-1 font-serif text-2xl text-foreground">7 минут</div>
          </div>
        </div>
      </section>

      {/* STARTER KIT */}
      <section className="border-y border-border/60 bg-secondary/40 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-10">
          <div className="text-center">
            <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Что входит
            </div>
            <h2 className="mt-3 font-serif text-[34px] leading-tight text-foreground md:text-[48px]">
              Стартовый набор NEW FACE
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: PlayCircle,
                tag: "Видеоурок",
                title: "7 минут с экспертом",
                sub: "Повторяйте движения вместе с Еленой. Спокойный темп, крупные планы, объяснение каждого приёма.",
              },
              {
                icon: FileText,
                tag: "PDF-инструкция",
                title: "Подробные схемы движений",
                sub: "Пошаговая инструкция с фотографиями и схемами. Открывается на телефоне и распечатывается на A4.",
              },
              {
                icon: ClipboardCheck,
                tag: "Чек-лист",
                title: "7 дней новой привычки",
                sub: "Готовый ежедневный протокол — чтобы утренний ритуал закрепился и стал частью ухода.",
              },
            ].map((c) => (
              <div
                key={c.tag}
                className="flex flex-col rounded-3xl bg-card p-8 shadow-[0_20px_50px_-30px_rgba(120,80,50,0.35)] transition hover:-translate-y-1"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <c.icon className="h-7 w-7" strokeWidth={1.5} />
                </div>
                <div className="mt-6 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  {c.tag}
                </div>
                <div className="mt-2 font-serif text-2xl text-foreground">
                  {c.title}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {c.sub}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a
              href="#starter-kit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-10 py-4 text-[15px] font-medium text-primary-foreground shadow-[0_20px_45px_-20px_rgba(155,110,75,0.55)] transition hover:brightness-105"
            >
              Получить бесплатно
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </a>
          </div>
        </div>
      </section>

      {/* WHY PUFFINESS */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Почему это работает
          </div>
          <h2 className="mt-3 font-serif text-[34px] leading-tight text-foreground md:text-[48px]">
            Почему появляются <span className="italic text-primary">утренние отёки</span>?
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground md:text-base">
            На внешний вид лица влияет множество факторов. Регулярный
            самомассаж может стать частью ежедневного ухода и помогает
            поддерживать более свежий внешний вид.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Droplets,
              title: "Застой лимфы",
              sub: "Во время сна жидкость распределяется иначе — утром лицо может выглядеть более отёчным, особенно в области век и овала.",
            },
            {
              icon: Waves,
              title: "Напряжение мышц",
              sub: "Мышцы лица ежедневно работают во время речи и эмоций. Их бережное расслабление помогает лицу выглядеть более отдохнувшим.",
            },
            {
              icon: Heart,
              title: "Ежедневные привычки",
              sub: "Сон, вода, питание и регулярный уход вместе оказывают влияние на внешний вид кожи и общее ощущение свежести.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-3xl border border-border bg-card p-8"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <c.icon className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <div className="mt-6 font-serif text-2xl text-foreground">
                {c.title}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {c.sub}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="border-y border-border/60 bg-card/40 py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-5 md:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Через 7 дней практики
            </div>
            <h2 className="mt-3 font-serif text-[34px] leading-tight text-foreground md:text-[44px]">
              Что вы получите после недели ритуала
            </h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-3xl gap-3">
            {[
              "Лицо утром выглядит более свежим и отдохнувшим",
              "Утренний уход занимает всего 7 минут — легко встроить в любой день",
              "Появляется полезная привычка ежедневного бережного самоухода",
              "Осваиваете безопасную технику самомассажа с понятными схемами",
            ].map((t) => (
              <div
                key={t}
                className="flex items-start gap-4 rounded-2xl bg-background px-6 py-5"
              >
                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </div>
                <span className="text-[15px] leading-relaxed text-foreground">
                  {t}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERT */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:px-10 md:py-28">
        <div className="grid gap-12 md:grid-cols-[1fr_1.1fr] md:gap-16 md:items-center">
          <div className="relative overflow-hidden rounded-[2rem] bg-secondary shadow-[0_40px_80px_-40px_rgba(120,80,50,0.4)]">
            <img
              src={expertMethod}
              alt="Елена Миронова демонстрирует технику самомассажа"
              width={1280}
              height={1024}
              loading="lazy"
              className="h-[520px] w-full object-cover md:h-[620px]"
            />
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Метод NEW FACE
            </div>
            <h2 className="mt-3 font-serif text-[34px] leading-tight text-foreground md:text-[46px]">
              Познакомьтесь <br />с автором метода
            </h2>

            <div className="mt-8">
              <div className="font-serif text-2xl text-foreground">
                Елена Миронова
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Специалист по эстетическому массажу лица
              </div>
            </div>

            <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
              Елена помогает женщинам освоить простые техники ежедневного
              самомассажа, которые легко выполнять дома без специального
              оборудования.
            </p>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
              Методика <span className="font-medium text-foreground">NEW FACE</span>{" "}
              построена вокруг идеи регулярного и бережного ухода, который
              можно встроить даже в самый загруженный день.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                "Естественный подход",
                "Ежедневная практика",
                "Простые техники",
                "Без сложного оборудования",
              ].map((t) => (
                <div
                  key={t}
                  className="flex items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground"
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-y border-border/60 bg-secondary/40 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Отзывы участниц метода
            </div>
            <h2 className="mt-3 font-serif text-[34px] leading-tight text-foreground md:text-[44px]">
              Что говорят те, кто уже попробовал
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Анна",
                age: 39,
                text: "Искала простые упражнения именно против утренних отёков. После недели практики лицо утром действительно выглядит свежее, а сам уход стал приятным ритуалом.",
              },
              {
                name: "Ольга",
                age: 46,
                text: "Понравилось, что всё показано спокойно и понятно. На выполнение уходит совсем немного времени — я успеваю до чашки кофе.",
              },
              {
                name: "Марина",
                age: 52,
                text: "Раньше постоянно искала разные упражнения в интернете. Здесь всё собрано в одном месте — понятно, красиво, удобно.",
              },
            ].map((r) => (
              <div
                key={r.name}
                className="flex flex-col rounded-3xl bg-card p-8 shadow-[0_20px_50px_-30px_rgba(120,80,50,0.3)]"
              >
                <Quote className="h-6 w-6 text-primary/60" strokeWidth={1.5} />
                <p className="mt-5 flex-1 text-[15px] leading-relaxed text-foreground/85">
                  {r.text}
                </p>
                <div className="mt-6 border-t border-border pt-4">
                  <div className="font-serif text-lg text-foreground">
                    {r.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {r.age} лет
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STARTER KIT FORM */}
      <section id="starter-kit" className="bg-primary/8 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-14 px-5 md:grid-cols-[1fr_1.1fr] md:items-center md:px-10">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Заберите бесплатно
            </div>
            <h2 className="mt-3 font-serif text-[36px] leading-[1.05] tracking-tight text-foreground md:text-[52px]">
              Стартовый набор <span className="italic text-primary">NEW FACE</span>
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground md:text-base">
              Заполните форму — материалы придут сразу после регистрации.
              Видеоурок, PDF-инструкция и чек-лист на 7 дней. Без оплаты и
              подписки.
            </p>

            <div className="mt-8 space-y-2.5 text-sm text-foreground/85">
              {[
                "Мгновенный доступ к видеоуроку",
                "PDF-инструкция со схемами движений",
                "Чек-лист привычки на первые 7 дней",
                "Приглашение в закрытый Telegram-канал",
              ].map((t) => (
                <div key={t} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary" strokeWidth={2} />
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-card p-7 shadow-[0_40px_80px_-40px_rgba(120,80,50,0.35)] md:p-10">
            <div className="mb-6 text-center">
              <div className="font-serif text-2xl text-foreground md:text-3xl">
                Получить стартовый набор
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Пришлём материалы на email и в Telegram
              </p>
            </div>
            <LeadCaptureForm
              source="starter_kit"
              cta="Получить стартовый набор"
              note="Материалы бесплатны. Отправим ссылки на почту."
              extendedContacts
            />
          </div>
        </div>
      </section>

      {/* THREE WAYS TO START — kept below */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:px-10 md:py-28">
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Ещё способы начать
          </div>
          <h2 className="mt-3 font-serif text-[32px] leading-tight text-foreground md:text-[44px]">
            Четыре способа узнать <span className="italic text-primary">своё лицо</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground md:text-base">
            Быстрые интерактивные разборы — выберите тот, что откликается.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              to: "/quiz/diagnostic" as const,
              icon: Stethoscope,
              tag: "8 вопросов · 1 минута",
              title: "Диагностика лица",
              sub: "Что старит именно ваше лицо и как это исправить.",
              cta: "Пройти диагностику",
            },
            {
              to: "/builder" as const,
              icon: Layers3,
              tag: "Персональный ритуал",
              title: "Конструктор массажа",
              sub: "Соберите утренний ритуал под возраст, проблему и время.",
              cta: "Собрать ритуал",
            },
            {
              to: "/tracker" as const,
              icon: CalendarCheck,
              tag: "14 дней · трекер",
              title: "14 дней до нового лица",
              sub: "Ежедневный чек-лист, серия, напоминания и полоса прогресса.",
              cta: "Начать 14 дней",
            },
            {
              to: "/face-age" as const,
              icon: Hourglass,
              tag: "60 секунд · без фото",
              title: "Face Age Test",
              sub: "Узнайте биологический возраст вашего лица.",
              cta: "Пройти тест",
            },
          ].map((m) => (
            <Link
              key={m.to}
              to={m.to}
              className="group flex flex-col rounded-3xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-primary hover:shadow-[0_20px_50px_-20px_rgba(120,80,50,0.35)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <m.icon className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <div className="mt-5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {m.tag}
              </div>
              <div className="mt-2 font-serif text-2xl text-foreground">{m.title}</div>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{m.sub}</p>
              <div className="mt-5 flex items-center gap-2 text-sm font-medium text-primary">
                {m.cta}
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  strokeWidth={1.5}
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FULL COURSE — sales block leading to /course */}
      <section className="border-y border-border/60 bg-gradient-to-br from-primary/12 via-secondary to-background py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-10">
          <div className="grid gap-12 md:grid-cols-[1.15fr_1fr] md:items-center">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-primary">
                Полный курс · Natural Face Method
              </div>
              <h2 className="mt-4 font-serif text-[36px] leading-[1.05] tracking-tight text-foreground md:text-[52px]">
                Готовы к полному{" "}
                <span className="italic text-primary">преображению</span>?
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground md:text-base">
                Стартовый набор — это первое утро. Полный курс NEW FACE — это 12
                уроков по всем зонам лица, шеи и осанки. По 7 минут в день —
                и через 21 день лицо выглядит отдохнувшим само по себе.
              </p>

              <ul className="mt-8 grid gap-3 text-sm md:grid-cols-2 md:text-[15px]">
                {[
                  "12 видеоуроков, доступ навсегда",
                  "Приложение с AI-сканером и AR-подсказками",
                  "PDF-материалы и дневник практики",
                  "Разбор техники экспертом по видео",
                  "Закрытое сообщество участниц",
                  "Гарантия возврата 14 дней",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <Check className="mt-1 h-4 w-4 flex-none text-primary" strokeWidth={2} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-wrap items-baseline gap-4">
                <div className="font-serif text-4xl text-foreground md:text-5xl">
                  2 990 ₽
                </div>
                <div className="text-sm text-muted-foreground line-through">
                  4 990 ₽
                </div>
                <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                  −40% для новых участниц
                </span>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/course"
                  search={{ offer: "first" }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-4 text-[15px] font-medium text-primary-foreground transition hover:brightness-105"
                >
                  Смотреть полный курс
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
                <Link
                  to="/intensive"
                  className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-4 text-sm font-medium transition hover:border-primary hover:text-primary"
                >
                  Или интенсив за 590 ₽
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl bg-card p-8 shadow-[0_30px_80px_-40px_rgba(120,80,50,0.4)] md:p-10">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-primary">
                  <Quote className="h-3.5 w-3.5" strokeWidth={2} />
                  Отзыв участницы
                </div>
                <p className="mt-5 font-serif text-xl leading-snug text-foreground md:text-2xl">
                  «Через две недели я перестала пользоваться тональником по
                  утрам — лицо выглядит отдохнувшим само по себе.»
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-primary/15 font-serif text-lg leading-[44px] text-center text-primary">
                    А
                  </div>
                  <div>
                    <div className="text-sm font-medium">Анна, 38 лет</div>
                    <div className="text-xs text-muted-foreground">
                      выпускница потока
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-3 border-t border-border pt-6 text-center">
                  <div>
                    <div className="font-serif text-2xl text-foreground">12</div>
                    <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                      уроков
                    </div>
                  </div>
                  <div>
                    <div className="font-serif text-2xl text-foreground">7</div>
                    <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                      минут/день
                    </div>
                  </div>
                  <div>
                    <div className="font-serif text-2xl text-foreground">21</div>
                    <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                      день · эффект
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 text-center md:flex-row md:justify-between md:px-10 md:text-left">
          <div>
            <div className="font-serif text-lg tracking-[0.28em] leading-none text-foreground">
              NEW FACE
            </div>
            <div className="mt-1 text-[10px] tracking-[0.32em] uppercase text-muted-foreground">
              Natural Face Method
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              ИП Исмагилов Евгений Рамильевич<br />
              ИНН 631814767557
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground">Политика</a>
            <a href="#" className="hover:text-foreground">Контакты</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
