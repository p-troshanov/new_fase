import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Sparkles,
  Droplet,
  Camera,
  Moon,
  Hand,
  Flame,
  Trophy,
  Bell,
  BellOff,
  Check,
} from "lucide-react";
import { LeadCaptureForm } from "@/components/quiz/LeadCaptureForm";
import { TelegramCTA } from "@/components/quiz/TelegramCTA";

export const Route = createFileRoute("/tracker")({
  head: () => ({
    meta: [
      { title: "14-дневный трекер омоложения | NEW FACE" },
      {
        name: "description",
        content:
          "14 дней ежедневных ритуалов: массаж, вода, сон, фото прогресса. Трекер, серия достижений и напоминания.",
      },
      { property: "og:title", content: "14 дней до нового лица — трекер NEW FACE" },
      {
        property: "og:description",
        content: "Ежедневный чек-лист, полоса прогресса и серия. Ведите себя к новому лицу.",
      },
    ],
  }),
  component: TrackerPage,
});

const TASKS = [
  { id: "massage", label: "Массаж 7 минут", icon: Hand },
  { id: "water", label: "1.5 л воды", icon: Droplet },
  { id: "sleep", label: "Сон 7+ часов", icon: Moon },
  { id: "photo", label: "Фото прогресса", icon: Camera },
] as const;

type TaskId = (typeof TASKS)[number]["id"];

interface DayState {
  date: string; // yyyy-mm-dd
  tasks: Record<TaskId, boolean>;
}

interface TrackerData {
  startedAt: string; // ISO date
  email?: string;
  name?: string;
  reminders?: string | null; // "HH:MM" or null
  days: DayState[];
}

const STORAGE_KEY = "newface_tracker_v1";
const TOTAL_DAYS = 14;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function isoPlus(startIso: string, offset: number) {
  const d = new Date(startIso + "T00:00:00");
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function loadTracker(): TrackerData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TrackerData) : null;
  } catch {
    return null;
  }
}

function saveTracker(data: TrackerData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function initTracker(): TrackerData {
  const start = todayIso();
  return {
    startedAt: start,
    days: Array.from({ length: TOTAL_DAYS }).map((_, i) => ({
      date: isoPlus(start, i),
      tasks: { massage: false, water: false, sleep: false, photo: false },
    })),
  };
}

function TrackerPage() {
  const [phase, setPhase] = useState<"loading" | "intro" | "tracker">("loading");
  const [data, setData] = useState<TrackerData | null>(null);

  useEffect(() => {
    const existing = loadTracker();
    if (existing) {
      setData(existing);
      setPhase("tracker");
    } else {
      setPhase("intro");
    }
  }, []);

  if (phase === "loading") {
    return <div className="min-h-screen bg-background" />;
  }

  if (phase === "intro" || !data) {
    return (
      <IntroScreen
        onStart={() => {
          const fresh = initTracker();
          saveTracker(fresh);
          setData(fresh);
          setPhase("tracker");
        }}
      />
    );
  }

  return (
    <TrackerBoard
      data={data}
      onChange={(next) => {
        saveTracker(next);
        setData(next);
      }}
      onReset={() => {
        window.localStorage.removeItem(STORAGE_KEY);
        setData(null);
        setPhase("intro");
      }}
    />
  );
}

function IntroScreen({ onStart }: { onStart: () => void }) {
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
          14-дневный трекер
        </div>
        <h1 className="mt-4 font-serif text-[42px] leading-[1.05] tracking-tight md:text-[64px]">
          14 дней —
          <br />и <span className="italic text-primary">новое лицо</span>
        </h1>
        <p className="mt-6 max-w-md text-[15px] text-muted-foreground md:text-base">
          Ежедневный чек-лист: массаж, вода, сон, фото прогресса. Полоса прогресса, серия
          достижений и напоминания. Всё, чтобы дойти до результата.
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {TASKS.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
            >
              <t.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
              <span className="text-sm text-foreground">{t.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          className="mt-10 w-full max-w-sm rounded-2xl bg-primary py-4 text-[15px] font-medium text-primary-foreground transition hover:brightness-105"
        >
          Начать 14 дней
        </button>
        <p className="mt-3 text-xs text-muted-foreground">
          Прогресс сохраняется в вашем браузере. На следующем шаге можно оставить email —
          пришлём напоминания и первый урок.
        </p>
      </div>
    </main>
  );
}

function TrackerBoard({
  data,
  onChange,
  onReset,
}: {
  data: TrackerData;
  onChange: (d: TrackerData) => void;
  onReset: () => void;
}) {
  const today = todayIso();
  const dayIdxToday = data.days.findIndex((d) => d.date === today);
  const [activeIdx, setActiveIdx] = useState<number>(
    dayIdxToday >= 0 ? dayIdxToday : Math.min(TOTAL_DAYS - 1, data.days.length - 1),
  );

  const active = data.days[activeIdx];

  const totalChecks = TOTAL_DAYS * TASKS.length;
  const doneChecks = data.days.reduce(
    (acc, d) => acc + Object.values(d.tasks).filter(Boolean).length,
    0,
  );
  const overallPct = Math.round((doneChecks / totalChecks) * 100);

  const streak = useMemo(() => calcStreak(data), [data]);
  const bestStreak = useMemo(() => calcBestStreak(data), [data]);

  const toggle = (taskId: TaskId) => {
    const nextDays = data.days.map((d, i) =>
      i === activeIdx ? { ...d, tasks: { ...d.tasks, [taskId]: !d.tasks[taskId] } } : d,
    );
    onChange({ ...data, days: nextDays });
  };

  const activeDone = Object.values(active.tasks).filter(Boolean).length;
  const dayComplete = activeDone === TASKS.length;

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto max-w-3xl px-5 pt-8 pb-16 md:px-8 md:pt-12">
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> На главную
          </Link>
          <button
            onClick={() => {
              if (confirm("Сбросить прогресс и начать заново?")) onReset();
            }}
            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Сбросить
          </button>
        </div>

        <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          Ваш путь · 14 дней
        </div>
        <h1 className="mt-3 font-serif text-[32px] leading-tight md:text-[42px]">
          День <span className="italic text-primary">{activeIdx + 1}</span> из {TOTAL_DAYS}
        </h1>

        {/* Progress + streak */}
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-4 md:col-span-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Общий прогресс</span>
              <span className="tabular-nums text-foreground">{overallPct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${overallPct}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Выполнено {doneChecks} из {totalChecks} задач
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Flame className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <div className="font-serif text-xl leading-none tabular-nums">{streak}</div>
                <div className="text-xs text-muted-foreground">серия дней</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground">
                <Trophy className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <div className="font-serif text-xl leading-none tabular-nums">{bestStreak}</div>
                <div className="text-xs text-muted-foreground">рекорд серии</div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="mt-8">
          <div className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Календарь
          </div>
          <div className="grid grid-cols-7 gap-2">
            {data.days.map((d, i) => {
              const done = Object.values(d.tasks).filter(Boolean).length;
              const full = done === TASKS.length;
              const isActive = i === activeIdx;
              const isToday = d.date === today;
              const isFuture = d.date > today;
              return (
                <button
                  key={d.date}
                  onClick={() => setActiveIdx(i)}
                  className={`aspect-square rounded-xl border p-1.5 text-left transition ${
                    isActive
                      ? "border-primary bg-primary/5"
                      : full
                        ? "border-primary/40 bg-primary/5"
                        : "border-border bg-card hover:border-primary/40"
                  } ${isFuture && !isActive ? "opacity-60" : ""}`}
                >
                  <div className="flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <span className="font-serif text-base tabular-nums text-foreground">
                        {i + 1}
                      </span>
                      {full && (
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                          <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5">
                      {TASKS.map((t) => (
                        <div
                          key={t.id}
                          className={`h-1 flex-1 rounded-full ${
                            d.tasks[t.id] ? "bg-primary" : "bg-secondary"
                          }`}
                        />
                      ))}
                    </div>
                    {isToday && (
                      <div className="text-[9px] uppercase tracking-wider text-primary">
                        сегодня
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Day tasks */}
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Задачи дня {activeIdx + 1}
            </div>
            <div className="text-xs text-muted-foreground tabular-nums">
              {activeDone} / {TASKS.length}
            </div>
          </div>
          <div className="space-y-3">
            {TASKS.map((t) => {
              const checked = active.tasks[t.id];
              return (
                <button
                  key={t.id}
                  onClick={() => toggle(t.id)}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    checked
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
                      checked
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    <t.icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] font-medium text-foreground">{t.label}</div>
                  </div>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
                      checked ? "border-primary bg-primary" : "border-muted-foreground/40"
                    }`}
                  >
                    {checked && (
                      <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {dayComplete && (
            <div className="mt-4 animate-fade-in rounded-2xl bg-primary/10 p-4 text-center text-sm text-foreground">
              🎉 День {activeIdx + 1} закрыт! Так держать.
            </div>
          )}
        </div>

        {/* Reminders */}
        <ReminderBlock data={data} onChange={onChange} />

        {/* Email capture on day 3+ or when >= 25% done */}
        {(activeIdx >= 2 || overallPct >= 25) && !data.email && (
          <div className="mt-10 rounded-3xl bg-secondary/60 p-6 md:p-8">
            <div className="mb-4 text-center">
              <div className="font-serif text-xl md:text-2xl">Сохраните свой прогресс</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Пришлём напоминания на почту и первый урок метода NEW FACE.
              </p>
            </div>
            <LeadCaptureForm
              source="tracker"
              answers={{ startedAt: data.startedAt, doneChecks, dayIdx: activeIdx + 1 }}
              cta="Сохранить прогресс"
              note="Бесплатно. Прогресс останется в браузере."
            />
            <div className="mt-5 border-t border-border/60 pt-5">
              <TelegramCTA />
            </div>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            to="/course"
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-3 text-sm text-foreground transition hover:border-primary"
          >
            <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.5} />
            Готовы к полному курсу NEW FACE?
          </Link>
        </div>
      </div>
    </main>
  );
}

function ReminderBlock({
  data,
  onChange,
}: {
  data: TrackerData;
  onChange: (d: TrackerData) => void;
}) {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [time, setTime] = useState<string>(data.reminders ?? "08:30");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const enabled = !!data.reminders && permission === "granted";

  const enable = async () => {
    if (!("Notification" in window)) {
      alert("Ваш браузер не поддерживает уведомления.");
      return;
    }
    const result =
      Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      onChange({ ...data, reminders: time });
      new Notification("NEW FACE", {
        body: `Напоминания включены на ${time}. Увидимся завтра!`,
      });
    }
  };

  const disable = () => {
    onChange({ ...data, reminders: null });
  };

  // Schedule next notification while page is open
  useEffect(() => {
    if (!enabled) return;
    const [hh, mm] = time.split(":").map(Number);
    const now = new Date();
    const next = new Date();
    next.setHours(hh, mm, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    const delay = next.getTime() - now.getTime();
    const id = setTimeout(() => {
      if (Notification.permission === "granted") {
        new Notification("NEW FACE — время массажа", {
          body: "7 минут для себя. Отметьте задачи дня в трекере.",
        });
      }
    }, delay);
    return () => clearTimeout(id);
  }, [enabled, time]);

  return (
    <div className="mt-8 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {enabled ? (
            <Bell className="h-5 w-5" strokeWidth={1.5} />
          ) : (
            <BellOff className="h-5 w-5" strokeWidth={1.5} />
          )}
        </div>
        <div className="flex-1">
          <div className="text-[15px] font-medium text-foreground">Напоминания</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            Пуш-уведомление каждый день, когда вкладка открыта.
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              type="time"
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                if (enabled) onChange({ ...data, reminders: e.target.value });
              }}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
            {enabled ? (
              <button
                onClick={disable}
                className="rounded-xl border border-border bg-background px-4 py-2 text-sm text-foreground hover:border-primary"
              >
                Выключить
              </button>
            ) : (
              <button
                onClick={enable}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:brightness-105"
              >
                Включить
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function calcStreak(data: TrackerData): number {
  const today = todayIso();
  let streak = 0;
  for (let i = data.days.length - 1; i >= 0; i--) {
    const d = data.days[i];
    if (d.date > today) continue;
    const done = Object.values(d.tasks).filter(Boolean).length;
    const some = done > 0;
    if (some) streak++;
    else break;
  }
  return streak;
}

function calcBestStreak(data: TrackerData): number {
  let best = 0;
  let cur = 0;
  for (const d of data.days) {
    const done = Object.values(d.tasks).filter(Boolean).length;
    if (done > 0) {
      cur++;
      if (cur > best) best = cur;
    } else {
      cur = 0;
    }
  }
  return best;
}
