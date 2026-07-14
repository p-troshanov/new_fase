// src/routes/app.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  ArrowRight,
  ScanFace,
  Sparkles,
  Layers,
  Trophy,
  Camera,
  BellRing,
  Lock,
  Check,
  Smartphone,
  LineChart,
  Zap,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import appMockup from "@/assets/app-mockup.png.asset.json";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Приложение NEW FACE — AI-сканирование лица и AR-массаж" },
      {
        name: "description",
        content:
          "Мобильное приложение NEW FACE: AI-сканирование лица, AR-подсказки для массажа, скан «до/после» и умные напоминания. Доступ открыт участницам полного курса.",
      },
      { property: "og:title", content: "Приложение NEW FACE — AI + AR для лица" },
      {
        property: "og:description",
        content:
          "AI видит отёки и асимметрию, AR показывает, куда вести руки. Персональный протокол на каждый день. Доступ — для участниц полного курса.",
      },
    ],
  }),
  component: AppPage,
});

const features = [
  {
    icon: ScanFace,
    tag: "01 · AI-протокол",
    title: "Не надо вспоминать, что делать",
    lead:
      "Открываете камеру — AI за 2 секунды видит отёки, асимметрию, тонус и микро-морщины. Приложение само выбирает протокол на сегодня.",
    example:
      "«Сегодня рекомендую протокол №3 — лимфодренаж, 4 минуты»",
    points: [
      "Скан в один тап, без замеров и настроек",
      "Учитывает вчерашний сон, воду, стресс",
      "Убирает барьер выбора: не думаете — просто делаете",
    ],
  },
  {
    icon: Layers,
    tag: "02 · AR-подсказки",
    title: "Больше не надо пересматривать курс",
    lead:
      "Камера показывает ваше лицо, поверх — точки массажа и стрелки движения рук. Техника ставится глазами, а не памятью.",
    example: "Точки, стрелки и ритм — прямо на вашем отражении",
    points: [
      "Живые направляющие в такт вашему темпу",
      "Голосовой отсчёт: «вдох, ведём вверх, отпускаем»",
      "Работает без интернета — данные не покидают телефон",
    ],
  },
  {
    icon: Trophy,
    tag: "03 · Геймификация",
    title: "Прогресс, который видно на лице",
    lead:
      "Вместо абстрактных бейджей — измеримые изменения. Приложение считает индекс тонуса, симметрии и отёков и сравнивает с вашей группой.",
    example: "«Ваш лицевой тонус вырос на 12% за 14 дней»",
    points: [
      "«Вы опередили 73% участниц вашей возрастной группы»",
      "Пропуск виден: тонус падает — и это видно на скане",
      "Никаких «получите бейдж» — только цифры про ваше лицо",
    ],
  },
  {
    icon: Camera,
    tag: "04 · До/После",
    title: "Скан «до/после» каждые 7 дней",
    lead:
      "Раз в неделю приложение просит короткий скан и собирает сравнение с прошлой неделей. Визуальный прогресс, с которым не поспоришь.",
    example: "Слайдер «неделя 1 → неделя 4» с наложением",
    points: [
      "Свет и ракурс подсказывает интерфейс — сравнения честные",
      "Можно поделиться, но только если вы сами захотите",
      "Все сканы хранятся зашифрованно, только у вас",
    ],
  },
  {
    icon: BellRing,
    tag: "05 · Умные напоминания",
    title: "Напоминания, которые не бесят",
    lead:
      "Никаких «пора делать массаж!». Только контекст и польза — или мягкое напоминание про то, что вы можете потерять.",
    example:
      "«Скан показал: отёки +15% с утра. 3 минуты — и уходят»",
    points: [
      "«Стрик 12 дней. Пропустите — начнёте заново»",
      "Тихие часы, пауза на отпуск, ручной сдвиг ритуала",
      "Учит, когда вы обычно делаете практику — и подстраивается",
    ],
  },
];

function AppPage() {
  useEffect(() => {
    trackEvent("view:app");
  }, []);

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
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
            search={{ offer: "first" }}
            className="text-xs text-muted-foreground hover:text-foreground md:text-sm"
          >
            Полный курс →
          </Link>
        </div>

        {/* Hero */}
        <section className="mt-12 grid gap-12 md:mt-20 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
              <Lock className="h-3.5 w-3.5" strokeWidth={2} />
              Только для участниц курса
            </span>
            <h1 className="mt-6 font-serif text-[44px] leading-[1.02] tracking-tight md:text-[68px]">
              Приложение{" "}
              <span className="italic text-primary">NEW FACE</span> — метод у
              вас в руках
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground md:text-base">
              AI видит ваше лицо — и подбирает протокол на сегодня.
              AR подсказывает, куда вести руки. Скан «до/после» показывает
              результат, с которым не поспоришь.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/course"
                search={{ offer: "first" }}
                onClick={() => trackEvent("click:app_cta_hero")}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-4 text-[15px] font-medium text-primary-foreground transition hover:brightness-105"
              >
                Открыть доступ через курс
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
              <span className="text-xs text-muted-foreground">
                iOS · Android · без рекламы
              </span>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6">
              {[
                { v: "2 сек", l: "AI-скан лица" },
                { v: "4 показателя", l: "тонус · отёки · симметрия · морщины" },
                { v: "0 данных", l: "покидают телефон" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-serif text-2xl text-foreground md:text-3xl">
                    {s.v}
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Phone mockup */}
          <div className="relative mx-auto w-full max-w-[360px]">
            <div className="absolute -inset-8 -z-10 rounded-[60px] bg-gradient-to-br from-primary/20 via-secondary to-transparent blur-2xl" />
            <img
              src={appMockup.url}
              alt="Экран приложения NEW FACE: утренний ритуал, протокол №3 — лимфодренаж, прогресс 3 из 7 дней и библиотека протоколов"
              className="w-full drop-shadow-[0_40px_80px_rgba(120,80,50,0.35)]"
              loading="eager"
            />
          </div>
        </section>

        {/* Features */}
        <section className="mt-24 md:mt-32">
          <div className="max-w-2xl">
            <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Что внутри
            </div>
            <h2 className="mt-3 font-serif text-[36px] leading-tight md:text-[48px]">
              Пять вещей, которые снимают{" "}
              <span className="italic text-primary">барьер практики</span>
            </h2>
          </div>

          <div className="mt-14 space-y-8 md:space-y-12">
            {features.map((f, i) => (
              <article
                key={f.tag}
                className={`grid gap-8 rounded-3xl border border-border bg-card p-7 md:grid-cols-[1fr_1.15fr] md:items-center md:gap-14 md:p-12 ${
                  i % 2 ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <f.icon className="h-7 w-7" strokeWidth={1.5} />
                  </div>
                  <div className="mt-6 text-[11px] uppercase tracking-[0.28em] text-primary">
                    {f.tag}
                  </div>
                  <h3 className="mt-3 font-serif text-2xl leading-tight md:text-[32px]">
                    {f.title}
                  </h3>
                  <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                    {f.lead}
                  </p>
                </div>

                <div>
                  <div className="rounded-2xl bg-secondary/70 px-5 py-4 font-serif text-lg leading-snug text-foreground md:text-xl">
                    <span className="text-primary">“</span>
                    {f.example}
                    <span className="text-primary">”</span>
                  </div>
                  <ul className="mt-5 space-y-3 text-sm md:text-[15px]">
                    {f.points.map((p) => (
                      <li key={p} className="flex items-start gap-3">
                        <Check className="mt-1 h-4 w-4 flex-none text-primary" strokeWidth={2} />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* How access works */}
        <section className="mt-24 rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/12 via-secondary to-background p-8 md:mt-32 md:p-14">
          <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-center md:gap-14">
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-primary">
                <Lock className="h-3.5 w-3.5" strokeWidth={2} />
                Закрытый доступ
              </div>
              <h2 className="mt-4 font-serif text-3xl leading-tight md:text-[44px]">
                Как получить приложение
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                Приложение — часть полного курса NEW FACE. Доступ открывается в
                личном кабинете после первого урока, без отдельной оплаты.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/course"
                  search={{ offer: "first" }}
                  onClick={() => trackEvent("click:app_cta_bottom")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-4 text-[15px] font-medium text-primary-foreground transition hover:brightness-105"
                >
                  Забрать курс с доступом
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
                <Link
                  to="/intensive"
                  className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-4 text-sm font-medium transition hover:border-primary hover:text-primary"
                >
                  Сначала интенсив за 590 ₽
                </Link>
              </div>
            </div>

            <ol className="space-y-4">
              {[
                {
                  icon: Check,
                  title: "Оплачиваете полный курс",
                  sub: "12 уроков + приложение открываются сразу",
                },
                {
                  icon: Smartphone,
                  title: "Скачиваете приложение по ссылке",
                  sub: "iOS и Android, вход по email от курса",
                },
                {
                  icon: LineChart,
                  title: "Делаете первый скан",
                  sub: "AI собирает базовый профиль лица за 2 секунды",
                },
                {
                  icon: Zap,
                  title: "Получаете протокол на каждый день",
                  sub: "AR-подсказки и напоминания подстраиваются под вас",
                },
              ].map((s, i) => (
                <li
                  key={s.title}
                  className="flex gap-4 rounded-2xl bg-card px-5 py-4"
                >
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary/15 text-primary">
                    <s.icon className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                      Шаг {i + 1}
                    </div>
                    <div className="mt-0.5 text-[15px] font-medium">
                      {s.title}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground md:text-sm">
                      {s.sub}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Приложение работает офлайн. Все сканы хранятся зашифрованно на вашем
          устройстве.
        </p>

        <footer className="mt-16 pb-16 text-center text-xs text-muted-foreground space-y-1">
          <div>© NEW FACE · Natural Face Method</div>
          <div>ИП Исмагилов Евгений Рамильевич · ИНН 631814767557</div>
        </footer>
      </div>
    </main>
  );
}
