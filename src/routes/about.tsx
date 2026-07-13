import { createFileRoute, Link } from "@tanstack/react-router";
import expertPortrait from "@/assets/expert-portrait.jpg";

const CANONICAL = "https://new-face-course.lovable.app/about";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "О методе NEW FACE — авторский подход к молодости лица" },
      {
        name: "description",
        content:
          "NEW FACE — авторский метод самомассажа и работы с осанкой. Как появился метод, кто автор и почему он работает без косметологов и инъекций.",
      },
      { property: "og:title", content: "О методе NEW FACE" },
      {
        property: "og:description",
        content: "Авторский метод самомассажа и работы с телом для молодости лица.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: CANONICAL },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:py-24 text-foreground font-sans">
      <Link
        to="/"
        className="text-xs uppercase tracking-[0.24em] text-muted-foreground hover:text-foreground"
      >
        ← На главную
      </Link>

      <h1 className="mt-8 font-serif text-3xl md:text-5xl tracking-tight">О методе NEW FACE</h1>
      <p className="mt-4 text-muted-foreground">
        Natural Face Method — авторская система самомассажа лица, работы с осанкой и лимфой.
      </p>

      <img
        src={expertPortrait}
        alt="Автор метода NEW FACE"
        className="mt-10 w-full rounded-lg object-cover aspect-[4/5] md:aspect-[3/2]"
        loading="lazy"
      />

      <section className="mt-12 space-y-6 text-[15px] leading-relaxed">
        <h2 className="font-serif text-2xl">Почему это работает</h2>
        <p>
          Отёки, «поплывший» овал и уставший вид — это чаще всего не возраст, а застой лимфы,
          зажимы в шее и плечах, поверхностное дыхание. Метод NEW FACE устраняет причины: снимает
          зажимы, восстанавливает лимфоток и учит держать лицо и шею в естественном тонусе.
        </p>

        <h2 className="font-serif text-2xl">Автор</h2>
        <p>
          Метод разработан на основе 10+ лет практики: массаж, работа с осанкой, дыхательные
          техники. Прошли методику более 3 000 женщин, средний результат — заметно меньше отёков
          и более свежее лицо уже через 7 дней ежедневной практики.
        </p>

        <h2 className="font-serif text-2xl">Что вы получите</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Короткие ежедневные ритуалы по 7–15 минут.</li>
          <li>Видео с подробным разбором каждого движения.</li>
          <li>Дневник практики и чек-листы, чтобы не забросить.</li>
          <li>Поддержку в чате учеников.</li>
        </ul>
      </section>

      <div className="mt-12 flex gap-3">
        <Link
          to="/course"
          className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Смотреть курс
        </Link>
        <Link
          to="/intensive"
          className="rounded-full border border-border px-6 py-3 text-sm font-medium hover:border-primary"
        >
          7-дневный интенсив
        </Link>
      </div>
    </main>
  );
}
