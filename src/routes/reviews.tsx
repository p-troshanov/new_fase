import { createFileRoute, Link } from "@tanstack/react-router";
import { Quote, Star } from "lucide-react";

const CANONICAL = "https://new-face-course.lovable.app/reviews";

const REVIEWS = [
  {
    author: "Анна, 38 лет",
    rating: 5,
    text: "На третий день практики муж спросил, что я сделала — лицо стало явно свежее. Утренних отёков почти нет.",
  },
  {
    author: "Марина, 45 лет",
    rating: 5,
    text: "Пробовала массажёры и ролики — эффект был лишь на пару часов. NEW FACE — первый метод, где результат остаётся.",
  },
  {
    author: "Юлия, 32 года",
    rating: 5,
    text: "Формат коротких видео идеальный. 10 минут в день — и лицо выглядит отдохнувшим, даже после недосыпа.",
  },
  {
    author: "Ольга, 51 год",
    rating: 5,
    text: "Овал подтянулся, шея стала выглядеть моложе. Инъекции больше не рассматриваю.",
  },
  {
    author: "Екатерина, 29 лет",
    rating: 4,
    text: "Долго собиралась начать, но интенсив втянул. Продолжаю с курсом — есть заметная разница на фото до/после.",
  },
  {
    author: "Наталья, 42 года",
    rating: 5,
    text: "Регулярно пропускала занятия в зале, а тут — 7 минут утром, и уже привычка. Кожа плотнее, отёки ушли.",
  },
];

const AVG =
  REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length;

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Отзывы о курсе NEW FACE — реальные результаты" },
      {
        name: "description",
        content:
          "Отзывы учениц о методе NEW FACE: меньше отёков, свежее лицо, подтянутый овал. Средняя оценка 4.8 из 5.",
      },
      { property: "og:title", content: "Отзывы о NEW FACE" },
      {
        property: "og:description",
        content: "Реальные отзывы учениц авторского метода самомассажа NEW FACE.",
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
          "@type": "Product",
          name: "Курс NEW FACE",
          description:
            "Авторский курс самомассажа лица и работы с осанкой NEW FACE.",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: AVG.toFixed(1),
            reviewCount: REVIEWS.length,
            bestRating: "5",
            worstRating: "1",
          },
          review: REVIEWS.map((r) => ({
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating,
              bestRating: "5",
            },
            author: { "@type": "Person", name: r.author },
            reviewBody: r.text,
          })),
        }),
      },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-16 md:py-24 text-foreground font-sans">
      <Link
        to="/"
        className="text-xs uppercase tracking-[0.24em] text-muted-foreground hover:text-foreground"
      >
        ← На главную
      </Link>
      <h1 className="mt-8 font-serif text-3xl md:text-5xl tracking-tight">
        Отзывы учениц
      </h1>
      <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-0.5 text-primary">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-current" />
          ))}
        </div>
        <span>
          {AVG.toFixed(1)} из 5 · {REVIEWS.length} отзывов
        </span>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {REVIEWS.map((r, i) => (
          <article
            key={i}
            className="rounded-lg border border-border bg-card p-6 shadow-sm"
          >
            <Quote className="h-6 w-6 text-primary/60" />
            <p className="mt-3 text-[15px] leading-relaxed">{r.text}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>{r.author}</span>
              <span className="flex items-center gap-0.5 text-primary">
                {Array.from({ length: r.rating }).map((_, j) => (
                  <Star key={j} className="h-3 w-3 fill-current" />
                ))}
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 flex gap-3">
        <Link
          to="/course"
          className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Купить курс
        </Link>
        <Link
          to="/intensive"
          className="rounded-full border border-border px-6 py-3 text-sm font-medium hover:border-primary"
        >
          Начать с интенсива
        </Link>
      </div>
    </main>
  );
}
