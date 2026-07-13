import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  invoiceId: z.string().min(4).max(80),
});

export type OrderStatusResult = {
  found: boolean;
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled" | null;
  amountRub: number | null;
  currency: string | null;
  email: string | null;
  paidAt: string | null;
  createdAt: string | null;
  invoiceId: string;
  paymentMethod: string | null;
  transactionId: string | null;
};

export const getOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<OrderStatusResult> => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        "invoice_id, status, amount_kopecks, currency, email, paid_at, created_at, payment_method, transaction_id",
      )
      .eq("invoice_id", data.invoiceId)
      .maybeSingle();

    if (error || !order) {
      return {
        found: false,
        status: null,
        amountRub: null,
        currency: null,
        email: null,
        paidAt: null,
        createdAt: null,
        invoiceId: data.invoiceId,
        paymentMethod: null,
        transactionId: null,
      };
    }

    // Маскируем email для приватности (никто, кроме владельца, invoiceId не знает,
    // но всё равно не показываем адрес целиком).
    const maskEmail = (e: string | null) => {
      if (!e) return null;
      const [name, domain] = e.split("@");
      if (!domain) return null;
      const visible = name.slice(0, 2);
      return `${visible}${"•".repeat(Math.max(name.length - 2, 1))}@${domain}`;
    };

    return {
      found: true,
      status: order.status as OrderStatusResult["status"],
      amountRub: order.amount_kopecks / 100,
      currency: order.currency,
      email: maskEmail(order.email),
      paidAt: order.paid_at,
      createdAt: order.created_at,
      invoiceId: order.invoice_id,
      paymentMethod: order.payment_method ?? null,
      transactionId: order.transaction_id ?? null,
    };
  });
