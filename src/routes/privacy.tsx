// src/routes/privacy.tsx
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Политика конфиденциальности — NEW FACE" },
      {
        name: "description",
        content:
          "Как NEW FACE обрабатывает и защищает персональные данные пользователей: цели, состав, сроки хранения и права субъекта данных.",
      },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: PrivacyPage,
});

const SELLER = {
  short: "ИП Исмагилов Евгений Рамильевич",
  inn: "631814767557",
  email: "hello@newface.example",
};

function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:py-24 text-foreground font-sans">
      <Link to="/" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
        ← На главную
      </Link>
      <h1 className="mt-6 font-serif text-4xl leading-tight md:text-5xl">
        Политика конфиденциальности
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">Редакция от 04.07.2026</p>

      <div className="mt-10 space-y-5 text-[15px] leading-relaxed">
        <p>
          Оператор персональных данных: {SELLER.short}, ИНН {SELLER.inn} (далее —
          «Оператор»). Настоящая Политика составлена в соответствии с ФЗ № 152-ФЗ
          «О персональных данных».
        </p>

        <h2 className="mt-10 font-serif text-2xl">1. Какие данные мы собираем</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>имя, email, телефон (при оформлении заказа и лид-магнита);</li>
          <li>ответы на диагностический квиз;</li>
          <li>метаданные: IP-адрес, тип устройства, страницы посещения (cookies и аналитика);</li>
          <li>сведения об оплате (обрабатываются CloudPayments; мы не храним данные карт).</li>
        </ul>

        <h2 className="mt-10 font-serif text-2xl">2. Цели обработки</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>исполнение договора (доступ к материалам, отправка чеков);</li>
          <li>связь с пользователем по вопросам заказа и обучения;</li>
          <li>маркетинговые коммуникации — только при явном согласии;</li>
          <li>улучшение сайта и продукта (аналитика в агрегированном виде).</li>
        </ul>

        <h2 className="mt-10 font-serif text-2xl">3. Кто получает данные</h2>
        <p>
          Мы не передаём персональные данные третьим лицам, кроме случаев,
          предусмотренных законом. Данные передаются нашим подрядчикам, которые
          обеспечивают работу сервиса:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>CloudPayments — обработка платежей и фискализация чеков;</li>
          <li>хостинг-провайдер — хранение и передача данных;</li>
          <li>email-сервис — рассылка транзакционных писем.</li>
        </ul>

        <h2 className="mt-10 font-serif text-2xl">4. Сроки хранения</h2>
        <p>
          Данные хранятся столько, сколько требуется для целей обработки, но не
          дольше 5 лет с последнего взаимодействия. По запросу пользователя данные
          удаляются в течение 30 дней.
        </p>

        <h2 className="mt-10 font-serif text-2xl">5. Ваши права</h2>
        <p>
          Вы можете запросить доступ к своим данным, их исправление или удаление,
          отозвать согласие на обработку, направив письмо на{" "}
          <a href={`mailto:${SELLER.email}`} className="text-primary underline">
            {SELLER.email}
          </a>
          .
        </p>
      </div>
    </main>
  );
}
