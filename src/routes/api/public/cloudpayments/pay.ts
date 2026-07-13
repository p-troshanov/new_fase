import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

// CloudPayments Pay-webhook (result notification).
// В кабинете CP укажите URL: https://<ваш-домен>/api/public/cloudpayments/pay
// и включите HMAC-подпись — секрет мы сохраним как CLOUDPAYMENTS_API_SECRET.
//
// CP отправляет application/x-www-form-urlencoded с полями:
//   TransactionId, Amount, Currency, InvoiceId, Email, Status, Token, ...
// В заголовке `Content-HMAC` — base64(HMAC-SHA256(rawBody, secret)).
// Ответ должен быть JSON: { "code": 0 } — успех, любое другое — CP повторит попытку.

export const Route = createFileRoute("/api/public/cloudpayments/pay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.CLOUDPAYMENTS_API_SECRET;
        const rawBody = await request.text();

        // Если секрет ещё не настроен — принимаем, но НЕ проводим оплату.
        if (!secret) {
          console.warn(
            "[cloudpayments/pay] CLOUDPAYMENTS_API_SECRET is not set — skipping (returning code 13)",
          );
          return Response.json({ code: 13 });
        }

        const signatureHeader = request.headers.get("content-hmac") ?? "";
        const expected = createHmac("sha256", secret).update(rawBody).digest("base64");
        try {
          const sig = Buffer.from(signatureHeader, "utf8");
          const exp = Buffer.from(expected, "utf8");
          if (sig.length !== exp.length || !timingSafeEqual(sig, exp)) {
            console.warn("[cloudpayments/pay] Invalid HMAC signature");
            return Response.json({ code: 13 });
          }
        } catch {
          return Response.json({ code: 13 });
        }

        const params = new URLSearchParams(rawBody);
        const invoiceId = params.get("InvoiceId");
        const transactionId = params.get("TransactionId");
        const status = params.get("Status");
        const amount = params.get("Amount");
        const email = params.get("Email");

        if (!invoiceId) {
          return Response.json({ code: 13 });
        }

        try {
          const { supabaseAdmin } = await import(
            "@/integrations/supabase/client.server"
          );

          const { data: order, error: orderErr } = await supabaseAdmin
            .from("orders")
            .select("id, amount_kopecks, status")
            .eq("invoice_id", invoiceId)
            .maybeSingle();

          if (orderErr || !order) {
            console.error("[cloudpayments/pay] Order not found:", invoiceId, orderErr);
            return Response.json({ code: 10 }); // Wrong InvoiceId
          }

          // Идемпотентность
          if (order.status === "paid") {
            return Response.json({ code: 0 });
          }

          // Проверка суммы
          const paidKopecks = Math.round(Number(amount) * 100);
          if (paidKopecks !== order.amount_kopecks) {
            console.error(
              "[cloudpayments/pay] Amount mismatch:",
              paidKopecks,
              "!=",
              order.amount_kopecks,
            );
            return Response.json({ code: 11 }); // Wrong amount
          }

          const isSuccess = status === "Completed" || status === "Authorized";

          await supabaseAdmin
            .from("orders")
            .update({
              status: isSuccess ? "paid" : "failed",
              transaction_id: transactionId,
              paid_at: isSuccess ? new Date().toISOString() : null,
              payment_meta: Object.fromEntries(params.entries()),
            })
            .eq("id", order.id);

          // TODO: выдать доступ, отправить письмо с ссылкой на курс
          console.log("[cloudpayments/pay] Order updated:", invoiceId, status, email);

          return Response.json({ code: 0 });
        } catch (err) {
          console.error("[cloudpayments/pay] Handler error:", err);
          return Response.json({ code: 13 });
        }
      },
    },
  },
});
