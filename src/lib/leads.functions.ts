// src/lib/leads.functions.ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email().max(255),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+\d\s()\-]{6,30}$/, "Некорректный телефон")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  telegram: z
    .string()
    .trim()
    .max(64)
    .regex(/^@?[a-zA-Z0-9_]{3,32}$/, "Некорректный Telegram")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  source: z.string().trim().min(1).max(50).optional(),
  interest: z.string().trim().max(50).optional(),
  productId: z.string().trim().max(80).optional(),
  amountKopecks: z.number().int().min(0).max(100_000_000).optional(),
  answers: z.record(z.string(), z.unknown()).optional(),
  website: z.string().max(200).optional(),
  startedAt: z.number().optional(),
});

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input) => leadSchema.parse(input))
  .handler(async ({ data }) => {
    // Защита от ботов
    if (data.website && data.website.trim().length > 0) return { ok: true as const, id: null };
    if (data.startedAt && Date.now() - data.startedAt < 1200) return { ok: true as const, id: null };

    // Упаковываем данные строго под схему Jetplan
    const webhookData = {
      name: data.name,
      email: data.email,
      phone: data.phone ?? "",
      telegram: data.telegram ?? "",
      source_url: "https://new-face-course.lovable.app", // Ссылка на ваш сайт
      form_id: data.source ?? "lead_magnet", // Передаем источник в поле form_id
      other_info: `Интерес: ${data.interest ?? 'Не указан'}\nОтветы квиза: ${data.answers ? JSON.stringify(data.answers) : 'Нет'}`
    };

    // Отправляем в Jetplan
    void sendWebhook(webhookData).catch((e) => console.error("[leads.webhook]", e));
    void notifyAdminNewLead(data).catch((e) => console.error("[leads.notify]", e));

    return { ok: true as const, id: "dummy-lead-id" };
  });

async function notifyAdminNewLead(data: any) {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!lovableKey || !resendKey || !adminEmail) return;

  const html = `<h2>Новая заявка NEW FACE</h2><p><b>Имя:</b> ${data.name}</p><p><b>Email:</b> ${data.email}</p>`;
  await fetch("https://connector-gateway.lovable.dev/resend/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": resendKey,
    },
    body: JSON.stringify({
      from: "NEW FACE <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `Новая заявка: ${data.name}`,
      html,
    }),
  }).catch(() => {});
}

async function sendWebhook(payload: Record<string, any>) {
  const webhookUrl = "https://app.jetplan.site/api/webhooks/projects/28540c6c-72f0-4cd9-9b82-cf6fa46d40da/contacts";
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) console.error("[leads.webhook] error", res.status);
}
