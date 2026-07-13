import { createFileRoute, Link } from "@tanstack/react-router";

const CANONICAL = "https://new-face-course.lovable.app/faq";

const FAQ: { q: string; a: string }[] = [
  {
    q: "Сколько времени в день нужно уделять практике?",
    a: "От 7 до 15 минут в день. Уроки короткие и разбиты на утренние и вечерние ритуалы.",
  },
  {
    q: "Когда будут первые результаты?",
    a: "Уменьшение отёков и свежий цвет лица — уже через 3–5 дней. Заметная работа с овалом — через 3–4 недели ежедневной практики.",
  },
  {
    q: "Нужны ли специальные приспособления?",
    a: "Нет. Достаточно чистых рук и, при желании, масла или крема без силиконов. Никаких массажёров и роликов не требуется.",
  },
  {
    q: "Есть ли противопоказания?",
    a: "Острые воспаления, ЛОР-заболевания в стадии обострения, недавние косметологические процедуры (филлеры, нити) — с ними нужно проконсультироваться с врачом перед началом.",
  },
  {
    q: "Как долго у меня будет доступ к материалам?",
    a: "Доступ к купленному курсу — бессрочный. Вы можете возвращаться к урокам в любое время.",
  },
  {
    q: "Как получить чек и оплатить от юрлица?",
    a: "Чек после оплаты приходит на email автоматически. По вопросам оплаты от юрлица напишите нам на hello@newface.example.",
  },
  {
    q: "Можно ли вернуть деньги?",
    a: "Да, в течение 7 дней с момента покупки, если вы не смогли начать практику. Условия — в оферте.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — частые вопросы о курсе NEW FACE" },
      {
        name: "description",
        content:
          "Ответы на частые вопросы о методе NEW FACE: сколько заниматься, когда ждать результат, противопоказания, доступ к материалам и возврат.",
      },
      { property: "og:title", content: "FAQ — NEW FACE" },
      {
        property: "og:description",
        content: "Всё, что нужно знать перед покупкой курса или интенсива NEW FACE.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:py-24 text-foreground font-sans">
      <Link
        to="/"
        className="text-xs uppercase tracking-[0.24em] text-muted-foreground hover:text-foreground"
      >
        ← На главную
      </Link>
      <h1 className="mt-8 font-serif text-3xl md:text-5xl tracking-tight">
        Частые вопросы
      </h1>
      <p className="mt-4 text-muted-foreground">
        Не нашли ответ? Напишите нам на{" "}
        <a href="mailto:hello@newface.example" className="underline">
          hello@newface.example
        </a>
        .
      </p>

      <div className="mt-10 divide-y divide-border rounded-lg border border-border">
        {FAQ.map((f, i) => (
          <details key={i} className="group px-5 py-4">
            <summary className="cursor-pointer list-none font-medium flex items-start justify-between gap-4">
              <span>{f.q}</span>
              <span className="text-muted-foreground transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
