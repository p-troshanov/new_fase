// src/routes/contacts.tsx
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: "Контакты — NEW FACE" },
      {
        name: "description",
        content: "Как связаться с командой NEW FACE: email поддержки и реквизиты продавца.",
      },
    ],
  }),
  component: ContactsPage,
});

const SELLER = {
  short: "ИП Исмагилов Е. Р.",
  inn: "631814767557",
  ogrnip: "[Укажите ОГРНИП]",
  address: "[Укажите адрес регистрации]",
  email: "hello@newface.example",
};

function ContactsPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:py-24 text-foreground font-sans">
      <Link to="/" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
        ← На главную
      </Link>
      <h1 className="mt-6 font-serif text-4xl leading-tight md:text-5xl">Контакты</h1>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Поддержка
          </div>
          <div className="mt-3 font-serif text-2xl">Мы отвечаем в течение дня</div>
          <a
            href={`mailto:${SELLER.email}`}
            className="mt-4 inline-block text-primary underline"
          >
            {SELLER.email}
          </a>
          <p className="mt-3 text-sm text-muted-foreground">
            Вопросы по оплате, доступу к курсу, возвратам — сюда.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 text-sm leading-relaxed">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Реквизиты продавца
          </div>
          <div className="mt-3 space-y-1">
            <div>{SELLER.short}</div>
            <div>ИНН: {SELLER.inn}</div>
            <div>ОГРНИП: {SELLER.ogrnip}</div>
            <div>{SELLER.address}</div>
          </div>
          <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
            <Link to="/offer" className="hover:text-foreground">
              Оферта →
            </Link>
            <Link to="/privacy" className="hover:text-foreground">
              Конфиденциальность →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
