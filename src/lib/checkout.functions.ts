// Массаж/src/lib/checkout.functions.ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  PRODUCTS,
  type ProductKey,
  toKopecks,
  generateInvoiceId,
} from "./products";
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
  paymentMethod: z
    .enum(PAYMENT_METHOD_KEYS as [string, ...string[]])
    .optional(),
  items: z.array(orderItemSchema).min(1).max(10),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createOrderSchema.parse(input))
  .handler(async ({ data }) => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      throw new Error("Supabase env not configured");
    }
    const supabase = createClient<Database>(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Resolve items and compute total (server-side is source of truth for pricing)
    const items = data.items.map(({ product, quantity }) => {
      const p = PRODUCTS[product];
      return {
        sku: p.sku,
        title: p.title,
        kind: p.kind,
        quantity,
        unit_price_kopecks: toKopecks(p.price),
        vat: p.vat,
      };
    });

    const amount_kopecks = items.reduce(
      (sum, it) => sum + it.unit_price_kopecks * it.quantity,
      0,
    );

    const invoice_id = generateInvoiceId();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        invoice_id,
        email: data.email,
        name: data.name ?? null,
        phone: data.phone ?? null,
        amount_kopecks,
        currency: "RUB",
        offer_key: data.offerKey ?? null,
        promo_code: data.promoCode ?? null,
        source: data.source ?? null,
        session_id: data.sessionId ?? null,
        status: "pending",
        provider: "cloudpayments",
        payment_method: data.paymentMethod ?? null,
      })
      .select("id, invoice_id, amount_kopecks")
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message ?? "Failed to create order");
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((it) => ({
        order_id: order.id,
        sku: it.sku,
        title: it.title,
        kind: it.kind,
        quantity: it.quantity,
        unit_price_kopecks: it.unit_price_kopecks,
        vat: it.vat,
      })),
    );

    if (itemsError) {
      throw new Error(itemsError.message);
    }

    // Also create a linked lead so admin sees a single "заявки" surface,
    // and the sales team can send a manual payment link by email.
    const firstItem = items[0];
    const interest = firstItem?.kind ?? null;
    const { data: lead } = await supabase
      .from("leads")
      .insert({
        name: data.name ?? data.email.split("@")[0],
        email: data.email,
        phone: data.phone ?? null,
        source: data.source ?? "checkout",
        interest,
        product_id: firstItem?.sku ?? null,
        amount_kopecks,
      })
      .select("id")
      .single();

    if (lead?.id) {
      await supabase.from("orders").update({ lead_id: lead.id }).eq("id", order.id);
    }

    void sendWebhook({
      name: data.name ?? data.email.split("@")[0],
      email: data.email,
      phone: data.phone ?? null,
      source: data.source ?? "checkout",
      interest,
      amount_rub: order.amount_kopecks / 100,
    }).catch((e) => console.error("[checkout.webhook]", e));

    return {
      invoiceId: order.invoice_id,
      amountKopecks: order.amount_kopecks,
      amountRub: order.amount_kopecks / 100,
      currency: "RUB" as const,
      paymentMethod: data.paymentMethod ?? null,
      items: items.map((it) => ({
        sku: it.sku,
        title: it.title,
        quantity: it.quantity,
        priceRub: it.unit_price_kopecks / 100,
        vat: it.vat,
      })),
    };
  });

async function sendWebhook(data: Record<string, any>) {
  const webhookUrl = "https://app.jetplan.site/api/webhooks/projects/28540c6c-72f0-4cd9-9b82-cf6fa46d40da/contacts";
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    console.error("[checkout.webhook] error", res.status, await res.text());
  }
}
