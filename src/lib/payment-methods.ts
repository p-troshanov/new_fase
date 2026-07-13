// Единый каталог способов оплаты — используется в UI, при создании заказа
// и при отображении статуса на страницах /payment-success и /payment-cancel.

export type PaymentMethodKey =
  | "card"
  | "sbp"
  | "dolyame"
  | "halva"
  | "ozon"
  | "wb";

export type PaymentMethodInfo = {
  key: PaymentMethodKey;
  label: string;
  short: string;
  tag: string;
  installments: number; // 1 = разовая оплата
  provider: "cloudpayments" | "dolyame" | "halva" | "ozon" | "wb";
  description: string;
  pendingHint: string;
  failedHint: string;
};

export const PAYMENT_METHODS: Record<PaymentMethodKey, PaymentMethodInfo> = {
  card: {
    key: "card",
    label: "Банковская карта",
    short: "Картой",
    tag: "Visa · MC · Мир",
    installments: 1,
    provider: "cloudpayments",
    description: "Оплата картой любого банка. Мгновенное зачисление.",
    pendingHint:
      "Банк ещё не подтвердил списание с карты. Обычно это занимает несколько секунд.",
    failedHint:
      "Банк отклонил оплату картой. Попробуйте другую карту, СБП или оплату частями.",
  },
  sbp: {
    key: "sbp",
    label: "СБП — по QR",
    short: "СБП",
    tag: "Система быстрых платежей",
    installments: 1,
    provider: "cloudpayments",
    description: "Оплата через приложение вашего банка по QR-коду или ссылке.",
    pendingHint:
      "Ждём подтверждение из СБП. Если вы уже подтвердили платёж в приложении банка — статус обновится за 10–30 секунд.",
    failedHint:
      "СБП вернул отказ. Попробуйте оплатить снова или выберите оплату картой.",
  },
  dolyame: {
    key: "dolyame",
    label: "Долями — 4 платежа",
    short: "Долями",
    tag: "Т-Банк",
    installments: 4,
    provider: "dolyame",
    description:
      "4 равных платежа раз в 2 недели, без процентов и переплаты. Решение — за 15 секунд.",
    pendingHint:
      "Т-Банк проверяет заявку. Обычно решение приходит меньше чем за минуту.",
    failedHint:
      "Т-Банк не одобрил рассрочку. Можно попробовать Халву, OZON Рассрочку или оплату картой.",
  },
  halva: {
    key: "halva",
    label: "Халва — рассрочка",
    short: "Халва",
    tag: "Совкомбанк",
    installments: 4,
    provider: "halva",
    description: "Рассрочка на 4 месяца без процентов по карте Халва.",
    pendingHint: "Совкомбанк подтверждает рассрочку. Обычно это меньше минуты.",
    failedHint:
      "Совкомбанк не подтвердил рассрочку по Халве. Попробуйте другой способ.",
  },
  ozon: {
    key: "ozon",
    label: "OZON Рассрочка",
    short: "OZON",
    tag: "OZON Банк",
    installments: 4,
    provider: "ozon",
    description: "4 платежа без переплаты через OZON Банк.",
    pendingHint: "OZON Банк проверяет заявку — это занимает до минуты.",
    failedHint:
      "OZON Банк не одобрил рассрочку. Попробуйте Долями, Халву или оплату картой.",
  },
  wb: {
    key: "wb",
    label: "WB Кошелёк",
    short: "WB",
    tag: "WB Pay",
    installments: 4,
    provider: "wb",
    description: "Оплата частями через WB Кошелёк — 4 платежа без процентов.",
    pendingHint: "WB Pay подтверждает платёж. Это может занять до минуты.",
    failedHint:
      "WB Pay вернул отказ. Попробуйте другой способ оплаты.",
  },
};

export const PAYMENT_METHOD_KEYS = Object.keys(
  PAYMENT_METHODS,
) as PaymentMethodKey[];

export function isPaymentMethodKey(v: unknown): v is PaymentMethodKey {
  return typeof v === "string" && v in PAYMENT_METHODS;
}

export function getPaymentMethod(key: string | null | undefined) {
  if (!key || !isPaymentMethodKey(key)) return null;
  return PAYMENT_METHODS[key];
}

// Разбивка суммы на N платежей — округляем вверх, последний уравниваем.
export function splitInstallments(amountRub: number, parts: number) {
  if (parts <= 1) return [amountRub];
  const base = Math.ceil(amountRub / parts);
  const arr = Array(parts - 1).fill(base);
  const last = amountRub - base * (parts - 1);
  arr.push(last > 0 ? last : base);
  return arr;
}
