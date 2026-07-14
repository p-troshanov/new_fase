// src/lib/checkout.functions.ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PRODUCTS, type ProductKey, toKopecks, generateInvoiceId } from "./products";
import { PAYMENT_METHOD_KEYS } from "./payment-methods";

const orderItemSchema = z.object({
  product: z.enum(Object.keys(PRODUCTS) as [ProductKey, ...ProductKey[]]),
  quantity: z.number().int().min(1).max(10).default(1),
});

const createOrderSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(30).optional(),
  offerKey: z.string().max(80).optional(),
  promoCode: z.string().max(80).optional(),
  source: z.string().max(80).optional(),
  sessionId: z.string().max(80).optional(),
  paymentMethod: z.enum(PAYMENT_METHOD_KEYS as [string, ...string[]]).optional(),
  items: z.array(orderItemSchema).min(1).max(10),
});

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createOrderSchema.parse(input))
  .handler(async ({ data }) => {
    const invoice_id = generateInvoiceId();
    const firstItem = data.items[0];
    const productDef = PRODUCTS[firstItem.product];

    // Упаковываем данные корзины под схему Jetplan
    const webhookData = {
      name: data.name ?? data.email.split("@")[0],
      email: data.email,
      phone: data.phone ?? "",
      telegram: "", // В форме оплаты нет тг
      source_url: "https://new-face-course.lovable.app/checkout",
      form_id: data.source ?? "checkout_form",
      other_info: `Попытка оплаты товара: ${firstItem.product}\nСумма: ${productDef.price} руб.`
    };

    // Отправляем как заявку в Jetplan
    void sendWebhook(webhookData).catch((e) => console.error("[checkout.webhook]", e));

    // Возвращаем фейковый заказ, чтобы интерфейс перешел на страницу Спасибо
    return {
      invoiceId: invoice_id,
      amountKopecks: toKopecks(productDef.price),
      amountRub: productDef.price,
      currency: "RUB" as const,
      paymentMethod: data.paymentMethod ?? null,
      items: data.items.map((it) => ({
        sku: PRODUCTS[it.product].sku,
        title: PRODUCTS[it.product].title,
        quantity: it.quantity,
        priceRub: PRODUCTS[it.product].price,
        vat: PRODUCTS[it.product].vat,
      })),
    };
  });

async function sendWebhook(payload: Record<string, any>) {
  const webhookUrl = "https://app.jetplan.site/api/webhooks/projects/28540c6c-72f0-4cd9-9b82-cf6fa46d40da/contacts";
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
}
