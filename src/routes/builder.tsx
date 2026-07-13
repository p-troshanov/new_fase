import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, SkipForward, RotateCcw, Wind, Droplet, Sparkles, Eye } from "lucide-react";
import { QuizShell, OptionCard } from "@/components/quiz/QuizShell";
import { LeadCaptureForm } from "@/components/quiz/LeadCaptureForm";
import { TelegramCTA } from "@/components/quiz/TelegramCTA";

export const Route = createFileRoute("/builder")({
  head: () => ({
    meta: [
      { title: "Конструктор утреннего массажа лица | NEW FACE" },
      {
        name: "description",
        content:
          "Соберите идеальный утренний ритуал массажа лица под ваш возраст, время и главную проблему. Таймер и последовательность внутри.",
      },
      { property: "og:title", content: "Конструктор утреннего массажа — NEW FACE" },
      {
        property: "og:description",
        content: "Ваш персональный ритуал за 5–10 минут. С таймером и последовательностью.",
      },
    ],
  }),
  component: BuilderPage,
});

type Age = "25-35" | "35-45" | "45+";
type Focus = "swelling" | "nasolabial" | "oval" | "eyes";
type Extra = "chin" | "clench" | "dull";
type Time = 5 | 7 | 10;

interface Block {
  key: string;
  title: string;
  minutes: number;
  desc: string;
  icon: typeof Wind;
}

function buildRitual(focus: Focus, time: Time): Block[] {
  // distribution weights per focus
  const dist: Record<Focus, Record<string, number>> = {
    swelling: { neck: 0.15, lymph: 0.45, oval: 0.2, eyes: 0.2 },
    nasolabial: { neck: 0.1, lymph: 0.2, oval: 0.55, eyes: 0.15 },
    oval: { neck: 0.15, lymph: 0.15, oval: 0.6, eyes: 0.1 },
    eyes: { neck: 0.1, lymph: 0.3, oval: 0.15, eyes: 0.45 },
  };
  const w = dist[focus];
  const raw = {
    neck: Math.max(1, Math.round(time * w.neck)),
    lymph: Math.max(1, Math.round(time * w.lymph)),
    oval: Math.max(1, Math.round(time * w.oval)),
    eyes: Math.max(1, Math.round(time * w.eyes)),
  };
  // adjust to hit exact total
  let sum = raw.neck + raw.lymph + raw.oval + raw.eyes;
  const keys: (keyof typeof raw)[] = ["oval", "lymph", "eyes", "neck"];
  let i = 0;
  while (sum !== time) {
    const k = keys[i % keys.length];
    if (sum < time) raw[k] += 1;
    else if (raw[k] > 1) raw[k] -= 1;
    sum = raw.neck + raw.lymph + raw.oval + raw.eyes;
    i++;
    if (i > 50) break;
  }
  return [
    {
      key: "neck",
      title: "Шея",
      minutes: raw.neck,
      desc: "Разогрев, снятие зажимов, подготовка лимфооттока.",
      icon: Wind,
    },
    {
      key: "lymph",
      title: "Лимфодренаж",
      minutes: raw.lymph,
      desc: "Убираем отёки, восстанавливаем движение жидкости.",
      icon: Droplet,
    },
    {
      key: "oval",
      title: "Овал и щёки",
      minutes: raw.oval,
      desc: "Проработка мышц овала, лифт контура и скул.",
      icon: Sparkles,
    },
    {
      key: "eyes",
      title: "Зона глаз",
      minutes: raw.eyes,
      desc: "Мягкий дренаж, снятие напряжения, свежий взгляд.",
      icon: Eye,
    },
  ];
}

function BuilderPage() {
  const [step, setStep] = useState(1);
  const [age, setAge] = useState<Age | null>(null);
  const [focus, setFocus] = useState<Focus | null>(null);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [time, setTime] = useState<Time | null>(null);
  const total = 4;

  const goNext = () => setStep((s) => s + 1);
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  if (step === 5 && age && focus && time) {
    return (
      <RitualResult
        age={age}
        focus={focus}
        extras={extras}
        time={time}
        onRestart={() => {
          setStep(1);
          setAge(null);
          setFocus(null);
          setExtras([]);
          setTime(null);
        }}
      />
    );
  }

  return (
    <QuizShell
      step={step}
      total={total}
      eyebrow="Конструктор ритуала"
      onBack={step > 1 ? goBack : undefined}
    >
      {step === 1 && (
        <>
          <h1 className="font-serif text-[28px] leading-tight md:text-[36px]">Сколько вам лет?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Подберём техники под ваш возраст.
          </p>
          <div className="mt-8 space-y-3">
            {(["25-35", "35-45", "45+"] as Age[]).map((v) => (
              <OptionCard
                key={v}
                label={v === "45+" ? "45 и старше" : `${v} лет`}
                selected={age === v}
                onClick={() => {
                  setAge(v);
                  setTimeout(goNext, 180);
                }}
              />
            ))}
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="font-serif text-[28px] leading-tight md:text-[36px]">
            Что беспокоит больше всего?
          </h1>
          <div className="mt-8 space-y-3">
            {(
              [
                ["swelling", "Отёки, мешки, тяжёлое лицо"],
                ["nasolabial", "Носогубные складки"],
                ["oval", "Овал, второй подбородок, брыли"],
                ["eyes", "Уставший взгляд, круги под глазами"],
              ] as [Focus, string][]
            ).map(([v, label]) => (
              <OptionCard
                key={v}
                label={label}
                selected={focus === v}
                onClick={() => {
                  setFocus(v);
                  setTimeout(goNext, 180);
                }}
              />
            ))}
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h1 className="font-serif text-[28px] leading-tight md:text-[36px]">
            Что-то ещё добавим в фокус?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Можно выбрать несколько.</p>
          <div className="mt-8 space-y-3">
            {(
              [
                ["chin", "Второй подбородок"],
                ["clench", "Зажимы в челюсти / бруксизм"],
                ["dull", "Тусклый цвет кожи"],
              ] as [Extra, string][]
            ).map(([v, label]) => {
              const selected = extras.includes(v);
              return (
                <OptionCard
                  key={v}
                  label={label}
                  selected={selected}
                  onClick={() =>
                    setExtras((prev) =>
                      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
                    )
                  }
                />
              );
            })}
          </div>
          <button
            onClick={goNext}
            className="mt-8 w-full rounded-2xl bg-primary py-4 text-[15px] font-medium text-primary-foreground transition hover:brightness-105"
          >
            Дальше
          </button>
        </>
      )}

      {step === 4 && (
        <>
          <h1 className="font-serif text-[28px] leading-tight md:text-[36px]">
            Сколько времени у вас утром?
          </h1>
          <div className="mt-8 space-y-3">
            {([5, 7, 10] as Time[]).map((v) => (
              <OptionCard
                key={v}
                label={`${v} минут`}
                hint={
                  v === 5 ? "Экспресс-ритуал" : v === 7 ? "Оптимально" : "Полный ритуал"
                }
                selected={time === v}
                onClick={() => {
                  setTime(v);
                  setTimeout(() => setStep(5), 180);
                }}
              />
            ))}
          </div>
        </>
      )}
    </QuizShell>
  );
}

function RitualResult({
  age,
  focus,
  extras,
  time,
  onRestart,
}: {
  age: Age;
  focus: Focus;
  extras: Extra[];
  time: Time;
  onRestart: () => void;
}) {
  const blocks = useMemo(() => buildRitual(focus, time), [focus, time]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(blocks[0].minutes * 60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSecondsLeft(blocks[activeIdx].minutes * 60);
  }, [activeIdx, blocks]);

  useEffect(() => {
    if (!running) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (activeIdx < blocks.length - 1) {
            setActiveIdx((i) => i + 1);
            return blocks[activeIdx + 1].minutes * 60;
          }
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, activeIdx, blocks]);

  const total = blocks[activeIdx].minutes * 60;
  const pct = total > 0 ? ((total - secondsLeft) / total) * 100 : 0;
  const mm = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const ss = (secondsLeft % 60).toString().padStart(2, "0");

  const skip = () => {
    if (activeIdx < blocks.length - 1) setActiveIdx((i) => i + 1);
  };
  const reset = () => {
    setActiveIdx(0);
    setRunning(false);
    setSecondsLeft(blocks[0].minutes * 60);
  };

  const active = blocks[activeIdx];
  const r = 88;
  const c = 2 * Math.PI * r;
  const dash = c * (1 - pct / 100);

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto max-w-2xl px-5 pt-10 pb-16 md:px-8">
        <div className="text-center animate-fade-in">
          <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Ваш ритуал
          </div>
          <h1 className="mt-3 font-serif text-[32px] leading-tight md:text-[42px]">
            Утренний массаж на <span className="italic text-primary">{time} минут</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Подобрано под ваш возраст и главную проблему
          </p>
        </div>

        {/* Timer */}
        <div className="mt-10 flex flex-col items-center">
          <div className="relative">
            <svg width="220" height="220" viewBox="0 0 220 220" className="-rotate-90">
              <circle
                cx="110"
                cy="110"
                r={r}
                fill="none"
                stroke="hsl(var(--secondary))"
                strokeWidth="8"
              />
              <circle
                cx="110"
                cy="110"
                r={r}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={dash}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {active.title}
              </div>
              <div className="mt-1 font-serif text-5xl tabular-nums text-foreground">
                {mm}:{ss}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {activeIdx + 1} / {blocks.length}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={reset}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-secondary"
              aria-label="Сбросить"
            >
              <RotateCcw className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setRunning((r) => !r)}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:brightness-105"
              aria-label={running ? "Пауза" : "Старт"}
            >
              {running ? (
                <Pause className="h-7 w-7" strokeWidth={1.5} />
              ) : (
                <Play className="h-7 w-7 translate-x-0.5 fill-current" strokeWidth={0} />
              )}
            </button>
            <button
              onClick={skip}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-secondary"
              aria-label="Следующий"
            >
              <SkipForward className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Sequence */}
        <div className="mt-10 space-y-3">
          {blocks.map((b, i) => {
            const Icon = b.icon;
            const isActive = i === activeIdx;
            return (
              <button
                key={b.key}
                onClick={() => setActiveIdx(i)}
                className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div
                  className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
                    isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-[15px] font-medium text-foreground">{b.title}</div>
                    <div className="text-xs text-muted-foreground">{b.minutes} мин</div>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{b.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 rounded-3xl bg-secondary/60 p-6 md:p-8">
          <div className="mb-4 text-center">
            <div className="font-serif text-xl md:text-2xl">Сохранить ритуал</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Пришлём последовательность и первый урок с техниками на email
            </p>
          </div>
          <LeadCaptureForm
            source="builder"
            answers={{ age, focus, extras, time, sequence: blocks.map((b) => `${b.key}:${b.minutes}`) }}
            cta="Сохранить мой ритуал"
            note="Бесплатно. С видеоуроком 7 минут."
          />
          <div className="mt-5 border-t border-border/60 pt-5">
            <TelegramCTA />
          </div>
        </div>

        <button
          onClick={onRestart}
          className="mx-auto mt-6 block text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Пересобрать ритуал
        </button>
      </div>
    </main>
  );
}
