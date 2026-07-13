// Единый каталог продуктов и цен.
// Цены в рублях, конвертируем в копейки при записи в БД / отправке в CloudPayments.
// НДС: "none" — ИП на УСН 6% (без НДС).

export type ProductKind = "main" | "bump" | "upsell" | "downsell";

export type Product = {
  sku: string;
  title: string;
  price: number; // в рублях
  kind: ProductKind;
  vat: "none";
};

export const PRODUCTS = {
  // --- Основные продукты ---
  intensive: {
    sku: "intensive-590",
    title: "Мини-курс NEW FACE · 3 урока",
    price: 590,
    kind: "main",
    vat: "none",
  },
  intensive_lastcall: {
    sku: "intensive-390",
    title: "Мини-курс NEW FACE · 3 урока (спец. цена)",
    price: 390,
    kind: "main",
    vat: "none",
  },
  course_first: {
    sku: "course-2990",
    title: "Полный курс NEW FACE — первый заказ",
    price: 2990,
    kind: "main",
    vat: "none",
  },
  course_exit: {
    sku: "course-2690",
    title: "Полный курс NEW FACE — специальная цена",
    price: 2690,
    kind: "main",
    vat: "none",
  },
  course_returning: {
    sku: "course-3490",
    title: "Полный курс NEW FACE — возвращение",
    price: 3490,
    kind: "main",
    vat: "none",
  },
  course_default: {
    sku: "course-4990",
    title: "Полный курс NEW FACE",
    price: 4990,
    kind: "main",
    vat: "none",
  },

  // --- Order bump / апсейлы ---
  bump_pdf: {
    sku: "bump-pdf-490",
    title: "PDF «Дневник преображения» (доп.)",
    price: 490,
    kind: "bump",
    vat: "none",
  },
  upsell_vip: {
    sku: "upsell-vip-4900",
    title: "VIP-разбор техники по видео (1 месяц)",
    price: 4900,
    kind: "upsell",
    vat: "none",
  },
  upsell_app_year: {
    sku: "upsell-app-year-1990",
    title: "Приложение NEW FACE — доступ на год",
    price: 1990,
    kind: "upsell",
    vat: "none",
  },
} as const satisfies Record<string, Product>;

export type ProductKey = keyof typeof PRODUCTS;

export function toKopecks(rubles: number): number {
  return Math.round(rubles * 100);
}

// Формируем InvoiceId — уникальный идентификатор для CloudPayments.
export function generateInvoiceId(prefix = "NF"): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${ts}-${rnd}`;
}

// Система налогообложения для 54-ФЗ:
// 0 — ОСН, 1 — УСН доходы, 2 — УСН доходы-расходы, 3 — ЕНВД,
// 4 — ЕСХН, 5 — ПСН, 6 — самозанятые
export const TAXATION_SYSTEM = 1; // ИП на УСН 6% (доходы)
