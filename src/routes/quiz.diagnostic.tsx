import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Droplet, Waves, Zap, Sparkles } from "lucide-react";
import { QuizShell, OptionCard } from "@/components/quiz/QuizShell";
import { LeadCaptureForm } from "@/components/quiz/LeadCaptureForm";
import { TelegramCTA } from "@/components/quiz/TelegramCTA";

export const Route = createFileRoute("/quiz/diagnostic")({
  head: () => ({
    meta: [
      { title: "Диагностика лица — что старит именно вас | NEW FACE" },
      {
        name: "description",
        content:
          "Ответьте на 8 вопросов и получите персональный разбор: что именно старит ваше лицо и что с этим делать.",
      },
      { property: "og:title", content: "Диагностика лица — NEW FACE" },
      {
        property: "og:description",
        content: "8 вопросов — персональный протокол омоложения за 30 секунд.",
      },
    ],
  }),
  component: DiagnosticQuiz,
});

type Answer = "yes" | "sometimes" | "no";

const QUESTIONS: Array<{
  id: string;
  q: string;
  weight: { lymph: number; oval: number; muscle: number };
}> = [
  { id: "swelling", q: "У вас есть отёки по утрам?", weight: { lymph: 3, oval: 0, muscle: 0 } },
  { id: "chin", q: "Есть второй подбородок или брыли?", weight: { lymph: 1, oval: 3, muscle: 0 } },
  { id: "nasolabial", q: "Заметны носогубные складки?", weight: { lymph: 0, oval: 1, muscle: 3 } },
  { id: "age40", q: "Вам 40 лет или больше?", weight: { lymph: 1, oval: 2, muscle: 1 } },
  { id: "sedentary", q: "Работа сидячая, мало движения?", weight: { lymph: 2, oval: 1, muscle: 1 } },
  { id: "sleep", q: "Спите меньше 7 часов?", weight: { lymph: 2, oval: 0, muscle: 1 } },
  { id: "water", q: "Пьёте меньше 1.5 л воды в день?", weight: { lymph: 3, oval: 0, muscle: 0 } },
  { id: "stress", q: "Часто сжимаете челюсть, стресс?", weight: { lymph: 0, oval: 0, muscle: 3 } },
];

const OPTIONS: Array<{ v: Answer; label: string; mult: number }> = [
  { v: "yes", label: "Да", mult: 1 },
  { v: "sometimes", label: "Иногда", mult: 0.5 },
  { v: "no", label: "Нет", mult: 0 },
];

function DiagnosticQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const total = QUESTIONS.length;
  const current = QUESTIONS[step];

  const scores = useMemo(() => {
    const s = { lymph: 0, oval: 0, muscle: 0 };
    for (const q of QUESTIONS) {
      const a = answers[q.id];
      if (!a) continue;
      const mult = OPTIONS.find((o) => o.v === a)!.mult;
      s.lymph += q.weight.lymph * mult;
      s.oval += q.weight.oval * mult;
      s.muscle += q.weight.muscle * mult;
    }
    return s;
  }, [answers]);

  const ranked = useMemo(() => {
    const list = [
      {
        key: "lymph",
        score: scores.lymph,
        title: "Застой лимфы",
        icon: Droplet,
        signs: ["отёки", "мешки под глазами", "тяжёлое лицо"],
      },
      {
        key: "oval",
        score: scores.oval,
        title: "Ослабление овала",
        icon: Waves,
        signs: ["второй подбородок", "брыли", "поплывший контур"],
      },
      {
        key: "muscle",
        score: scores.muscle,
        title: "Спазм жевательных мышц",
        icon: Zap,
        signs: ["носогубки", "напряжение", "асимметрия"],
      },
    ];
    return list.sort((a, b) => b.score - a.score);
  }, [scores]);

  const handleAnswer = (v: Answer) => {
    const next = { ...answers, [current.id]: v };
    setAnswers(next);
    if (step + 1 < total) {
      setTimeout(() => setStep(step + 1), 180);
    } else {
      setAnalyzing(true);
      setTimeout(() => {
        setAnalyzing(false);
        setShowResult(true);
      }, 2200);
    }
  };

  if (analyzing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div className="animate-fade-in">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-8 w-8 animate-pulse text-primary" strokeWidth={1.5} />
          </div>
          <div className="font-serif text-2xl text-foreground">Анализируем ваше лицо…</div>
          <p className="mt-2 text-sm text-muted-foreground">Составляем персональный разбор</p>
        </div>
      </main>
    );
  }

  if (showResult) {
    return (
      <main className="min-h-screen bg-background font-sans text-foreground">
        <div className="mx-auto max-w-2xl px-5 pt-10 pb-16 md:px-8">
          <div className="text-center animate-fade-in">
            <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Ваш результат
            </div>
            <h1 className="mt-3 font-serif text-[36px] leading-tight text-foreground md:text-[48px]">
              Что старит именно
              <br />
              <span className="italic text-primary">ваше лицо</span>
            </h1>
          </div>

          <div className="mt-10 space-y-4">
            {ranked.map((p, i) => (
              <div
                key={p.key}
                className="rounded-3xl border border-border bg-card p-6 animate-fade-in"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${
                      i === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                    }`}
                  >
                    <p.icon className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      Проблема №{i + 1}
                    </div>
                    <div className="mt-1 font-serif text-xl text-foreground">{p.title}</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.signs.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-secondary px-3 py-1 text-xs text-foreground"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-3xl bg-secondary/60 p-6 md:p-8">
            <div className="mb-4 text-center">
              <div className="font-serif text-xl text-foreground md:text-2xl">
                Получите персональный протокол
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Пришлём разбор и первый урок метода NEW FACE под ваши проблемы
              </p>
            </div>
            <LeadCaptureForm
              source="diagnostic"
              answers={{ ...answers, ranked: ranked.map((r) => r.key) }}
              cta="Получить протокол"
              note="Бесплатно. PDF + видеоурок 7 минут."
            />
            <div className="mt-5 border-t border-border/60 pt-5">
              <TelegramCTA />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <QuizShell
      step={step + 1}
      total={total}
      eyebrow="Диагностика"
      onBack={step > 0 ? () => setStep(step - 1) : undefined}
    >
      <h1 className="font-serif text-[28px] leading-tight text-foreground md:text-[36px]">
        {current.q}
      </h1>
      <div className="mt-8 space-y-3">
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.v}
            label={opt.label}
            selected={answers[current.id] === opt.v}
            onClick={() => handleAnswer(opt.v)}
          />
        ))}
      </div>
    </QuizShell>
  );
}
