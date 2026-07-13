import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { QuizShell, OptionCard } from "@/components/quiz/QuizShell";
import { LeadCaptureForm } from "@/components/quiz/LeadCaptureForm";
import { TelegramCTA } from "@/components/quiz/TelegramCTA";

export const Route = createFileRoute("/face-age")({
  head: () => ({
    meta: [
      { title: "Face Age Test — на сколько лет выглядит ваше лицо | NEW FACE" },
      {
        name: "description",
        content:
          "Пройдите тест за 60 секунд и узнайте биологический возраст вашего лица. Без фото — только ответы.",
      },
      { property: "og:title", content: "Face Age Test — NEW FACE" },
      {
        property: "og:description",
        content: "Узнайте, насколько ваше лицо выглядит старше своего возраста.",
      },
    ],
  }),
  component: FaceAgePage,
});

type Val = "yes" | "no" | "sometimes";

const QUESTIONS: Array<{ id: string; q: string; penalty: number; label: string }> = [
  { id: "swelling", q: "Утром бывают отёки на лице?", penalty: 2, label: "отёки" },
  { id: "tone", q: "Кожа кажется дряблой, потерявшей упругость?", penalty: 3, label: "слабый тонус" },
  { id: "oval", q: "Овал лица «поплыл», есть брыли?", penalty: 3, label: "слабый овал" },
  { id: "nasolabial", q: "Заметны носогубные складки?", penalty: 2, label: "носогубки" },
  { id: "sleep", q: "Спите меньше 7 часов?", penalty: 2, label: "недосып" },
  { id: "water", q: "Пьёте меньше 1.5 л воды в день?", penalty: 1, label: "мало воды" },
  { id: "stress", q: "Часто в стрессе, сжимаете челюсть?", penalty: 2, label: "гипертонус" },
  { id: "sport", q: "Есть регулярная физическая активность?", penalty: -2, label: "спорт" },
  { id: "sun", q: "Загораете без SPF?", penalty: 2, label: "УФ без защиты" },
  { id: "care", q: "Есть постоянный уход за кожей?", penalty: -1, label: "регулярный уход" },
];

const OPTS: Array<{ v: Val; label: string; mult: number }> = [
  { v: "yes", label: "Да", mult: 1 },
  { v: "sometimes", label: "Иногда", mult: 0.5 },
  { v: "no", label: "Нет", mult: 0 },
];

function FaceAgePage() {
  const [phase, setPhase] = useState<"intro" | "age" | "quiz" | "analyzing" | "result">("intro");
  const [age, setAge] = useState<string>("");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Val>>({});
  const total = QUESTIONS.length;

  const { faceAge, delta, reasons } = useMemo(() => {
    const realAge = parseInt(age, 10) || 30;
    let d = 0;
    const factors: Array<{ label: string; weight: number }> = [];
    for (const q of QUESTIONS) {
      const a = answers[q.id];
      if (!a) continue;
      const mult = OPTS.find((o) => o.v === a)!.mult;
      const contribution = q.penalty * mult;
      d += contribution;
      if (contribution > 0) factors.push({ label: q.label, weight: contribution });
    }
    const rounded = Math.round(d);
    return {
      faceAge: Math.max(18, realAge + rounded),
      delta: rounded,
      reasons: factors.sort((a, b) => b.weight - a.weight).slice(0, 3),
    };
  }, [age, answers]);

  if (phase === "intro") {
    return (
      <main className="min-h-screen bg-background font-sans text-foreground">
        <div className="mx-auto max-w-2xl px-5 pt-8 pb-16 md:px-8 md:pt-12">
          <Link
            to="/"
            className="mb-10 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> На главную
          </Link>
          <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Face Age Test
          </div>
          <h1 className="mt-4 font-serif text-[42px] leading-[1.05] tracking-tight md:text-[64px]">
            Узнайте, насколько ваше лицо выглядит{" "}
            <span className="italic text-primary">старше</span> своего возраста
          </h1>
          <p className="mt-6 max-w-md text-[15px] text-muted-foreground md:text-base">
            10 быстрых вопросов, 60 секунд. Без фото — только ответы. Мы рассчитаем биологический
            возраст вашего лица и покажем главные причины.
          </p>
          <button
            onClick={() => setPhase("age")}
            className="mt-8 w-full max-w-sm rounded-2xl bg-primary py-4 text-[15px] font-medium text-primary-foreground transition hover:brightness-105"
          >
            Начать тест
          </button>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span>· Без фото</span>
            <span>· Без регистрации для прохождения</span>
            <span>· 60 секунд</span>
          </div>
        </div>
      </main>
    );
  }

  if (phase === "age") {
    return (
      <QuizShell step={1} total={total + 1} eyebrow="Face Age Test" onBack={() => setPhase("intro")}>
        <h1 className="font-serif text-[28px] leading-tight md:text-[36px]">Сколько вам лет?</h1>
        <p className="mt-2 text-sm text-muted-foreground">Введите ваш реальный возраст.</p>
        <input
          type="number"
          min={16}
          max={90}
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="например, 38"
          className="mt-8 w-full rounded-2xl border border-border bg-card py-5 px-6 text-center font-serif text-3xl tabular-nums text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={() => {
            const n = parseInt(age, 10);
            if (n >= 16 && n <= 90) setPhase("quiz");
          }}
          disabled={!(parseInt(age, 10) >= 16 && parseInt(age, 10) <= 90)}
          className="mt-6 w-full rounded-2xl bg-primary py-4 text-[15px] font-medium text-primary-foreground transition hover:brightness-105 disabled:opacity-50"
        >
          Продолжить
        </button>
      </QuizShell>
    );
  }

  if (phase === "quiz") {
    const current = QUESTIONS[step];
    const handleAnswer = (v: Val) => {
      const next = { ...answers, [current.id]: v };
      setAnswers(next);
      if (step + 1 < total) {
        setTimeout(() => setStep(step + 1), 180);
      } else {
        setPhase("analyzing");
        setTimeout(() => setPhase("result"), 2400);
      }
    };
    return (
      <QuizShell
        step={step + 2}
        total={total + 1}
        eyebrow="Face Age Test"
        onBack={
          step > 0
            ? () => setStep(step - 1)
            : () => setPhase("age")
        }
      >
        <h1 className="font-serif text-[28px] leading-tight md:text-[36px]">{current.q}</h1>
        <div className="mt-8 space-y-3">
          {OPTS.map((o) => (
            <OptionCard
              key={o.v}
              label={o.label}
              selected={answers[current.id] === o.v}
              onClick={() => handleAnswer(o.v)}
            />
          ))}
        </div>
      </QuizShell>
    );
  }

  if (phase === "analyzing") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div className="animate-fade-in">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-10 w-10 animate-pulse text-primary" strokeWidth={1.5} />
          </div>
          <div className="font-serif text-2xl">ИИ анализирует ваши ответы…</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Рассчитываем биологический возраст лица
          </p>
        </div>
      </main>
    );
  }

  // result
  const realAge = parseInt(age, 10);
  const olderBy = delta > 0 ? delta : 0;
  const youngerBy = delta < 0 ? Math.abs(delta) : 0;

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto max-w-2xl px-5 pt-10 pb-16 md:px-8">
        <div className="text-center animate-fade-in">
          <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Ваш результат
          </div>
          <h1 className="mt-3 font-serif text-[32px] leading-tight md:text-[42px]">
            Возраст лица
          </h1>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-3xl border border-border bg-card p-6 text-center">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Ваш возраст
            </div>
            <div className="mt-2 font-serif text-6xl tabular-nums text-foreground">{realAge}</div>
          </div>
          <div
            className={`rounded-3xl border p-6 text-center ${
              olderBy > 0
                ? "border-primary bg-primary/5"
                : "border-emerald-400/40 bg-emerald-50/40"
            }`}
          >
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Возраст лица
            </div>
            <div className="mt-2 font-serif text-6xl tabular-nums text-primary">{faceAge}</div>
          </div>
        </div>

        <div className="mt-4 text-center">
          {olderBy > 0 && (
            <p className="text-[15px] text-foreground">
              Ваше лицо выглядит на{" "}
              <span className="font-semibold text-primary">
                {olderBy} {plural(olderBy, ["год", "года", "лет"])} старше
              </span>{" "}
              реального возраста
            </p>
          )}
          {youngerBy > 0 && (
            <p className="text-[15px] text-foreground">
              Ваше лицо выглядит на{" "}
              <span className="font-semibold text-emerald-600">
                {youngerBy} {plural(youngerBy, ["год", "года", "лет"])} моложе
              </span>{" "}
              — отличная база!
            </p>
          )}
          {delta === 0 && (
            <p className="text-[15px] text-foreground">
              Возраст лица совпадает с реальным. Есть куда двигаться дальше.
            </p>
          )}
        </div>

        {reasons.length > 0 && (
          <div className="mt-10">
            <div className="mb-3 text-center text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Главные причины
            </div>
            <div className="space-y-3">
              {reasons.map((r, i) => (
                <div
                  key={r.label}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-serif text-primary">
                    {i + 1}
                  </div>
                  <div className="flex-1 text-[15px] capitalize text-foreground">{r.label}</div>
                  <div className="text-xs text-muted-foreground">+{r.weight.toFixed(1)} года</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 rounded-3xl bg-secondary/60 p-6 md:p-8">
          <div className="mb-4 text-center">
            <div className="font-serif text-xl md:text-2xl">Получите план омоложения</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Персональный протокол под ваши причины + первый урок метода NEW FACE
            </p>
          </div>
          <LeadCaptureForm
            source="face_age"
            answers={{ realAge, faceAge, delta, answers, reasons: reasons.map((r) => r.label) }}
            cta="Получить план"
            note="Бесплатно. Пришлём на email."
          />
          <div className="mt-5 border-t border-border/60 pt-5">
            <TelegramCTA />
          </div>
        </div>
      </div>
    </main>
  );
}

function plural(n: number, forms: [string, string, string]) {
  const abs = Math.abs(n) % 100;
  const n1 = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (n1 > 1 && n1 < 5) return forms[1];
  if (n1 === 1) return forms[0];
  return forms[2];
}
