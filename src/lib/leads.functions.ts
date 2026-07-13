// Массаж/src/lib/leads.functions.ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

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
  // Anti-spam: honeypot must be empty; startedAt catches instant submissions
  website: z.string().max(200).optional(),
  startedAt: z.number().optional(),
});

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input) => leadSchema.parse(input))
  .handler(async ({ data }) => {
    // Honeypot: bots fill hidden field. Pretend success.
    if (data.website && data.website.trim().length > 0) {
      return { ok: true as const };
    }
    // Too-fast submissions (< 1.2s) are almost always bots.
    if (data.startedAt && Date.now() - data.startedAt < 1200) {
      return { ok: true as const };
    }

    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    // Basic rate limit: max 3 leads per email in 60s
    const since = new Date(Date.now() - 60_000).toISOString();
    const { count: recentCount } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("email", data.email)
      .gte("created_at", since);
    if ((recentCount ?? 0) >= 3) {
      throw new Error("Слишком много заявок. Попробуйте через минуту.");
    }

    // IP/user-agent capture is not available on the current TanStack Start
    // server runtime helpers; leave null for now.
    const ip: string | null = null;
    const ua: string | null = null;



    const { data: inserted, error } = await supabase
      .from("leads")
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        telegram: data.telegram ?? null,
        source: data.source ?? "newface_lead_magnet",
        interest: data.interest ?? null,
        product_id: data.productId ?? null,
        amount_kopecks: data.amountKopecks ?? null,
        ip_address: ip,
        user_agent: ua,
        answers: (data.answers ?? null) as never,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[leads.insert]", error);
      throw new Error("Не удалось сохранить заявку. Попробуйте ещё раз.");
    }

    void notifyAdminNewLead(data).catch((e) => console.error("[leads.notify]", e));
    void sendWebhook(data).catch((e) => console.error("[leads.webhook]", e));

    return { ok: true as const, id: inserted?.id ?? null };
  });

async function notifyAdminNewLead(data: {
  name: string;
  email: string;
  phone?: string;
  telegram?: string;
  source?: string;
  interest?: string;
}) {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!lovableKey || !resendKey || !adminEmail) return;

  const html = `
    <h2>Новая заявка NEW FACE</h2>
    <p><b>Имя:</b> ${escapeHtml(data.name)}</p>
    <p><b>Email:</b> ${escapeHtml(data.email)}</p>
    ${data.phone ? `<p><b>Телефон:</b> ${escapeHtml(data.phone)}</p>` : ""}
    ${data.telegram ? `<p><b>Telegram:</b> ${escapeHtml(data.telegram)}</p>` : ""}
    ${data.interest ? `<p><b>Интерес:</b> ${escapeHtml(data.interest)}</p>` : ""}
    <p><b>Источник:</b> ${escapeHtml(data.source ?? "newface_lead_magnet")}</p>
  `;

  const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
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
  });
  if (!res.ok) {
    console.error("[leads.notify] resend", res.status, await res.text());
  }
}

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
    console.error("[leads.webhook] error", res.status, await res.text());
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
