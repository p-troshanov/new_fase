import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const LEAD_STATUSES = ["new", "in_progress", "won", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { status?: string; search?: string } | undefined) =>
    z
      .object({ status: z.string().optional(), search: z.string().optional() })
      .optional()
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    let q = context.supabase
      .from("orders")
      .select(
        "id, invoice_id, email, name, amount_kopecks, currency, status, offer_key, payment_method, created_at, paid_at, lead_id",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    if (data?.status && data.status !== "all") q = q.eq("status", data.status);
    if (data?.search) q = q.ilike("email", `%${data.search}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminUpdateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: string }) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "paid", "failed", "refunded", "cancelled"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const patch: { status: typeof data.status; paid_at?: string } = { status: data.status };
    if (data.status === "paid") patch.paid_at = new Date().toISOString();
    const { error } = await context.supabase
      .from("orders")
      .update(patch)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (
      input:
        | {
            status?: string;
            source?: string;
            interest?: string;
            search?: string;
            from?: string;
            to?: string;
          }
        | undefined,
    ) =>
      z
        .object({
          status: z.string().optional(),
          source: z.string().optional(),
          interest: z.string().optional(),
          search: z.string().optional(),
          from: z.string().optional(),
          to: z.string().optional(),
        })
        .optional()
        .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    let q = context.supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (data?.status && data.status !== "all") q = q.eq("status", data.status as LeadStatus);

    if (data?.source && data.source !== "all") q = q.eq("source", data.source);
    if (data?.interest && data.interest !== "all") q = q.eq("interest", data.interest);
    if (data?.from) q = q.gte("created_at", data.from);
    if (data?.to) q = q.lte("created_at", data.to);
    if (data?.search) {
      const s = data.search.replace(/[%_]/g, "\\$&");
      q = q.or(`name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminUpdateLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id: string;
      handled?: boolean;
      admin_notes?: string;
      status?: LeadStatus;
    }) =>
      z
        .object({
          id: z.string().uuid(),
          handled: z.boolean().optional(),
          admin_notes: z.string().max(2000).optional(),
          status: z.enum([...LEAD_STATUSES] as [LeadStatus, ...LeadStatus[]]).optional(),
        })
        .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { id, ...patch } = data;
    // Keep handled in sync with status for backward compatibility.
    if (patch.status && patch.handled === undefined) {
      patch.handled = patch.status !== "new";
    }
    const { error } = await context.supabase.from("leads").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminLeadStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { count: newCount } = await context.supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("status", "new");
    const { count: total } = await context.supabase
      .from("leads")
      .select("id", { count: "exact", head: true });
    return { newCount: newCount ?? 0, total: total ?? 0 };
  });

export const adminFunnelSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const [ordersRes, leadsRes, eventsRes] = await Promise.all([
      context.supabase.from("orders").select("status", { count: "exact", head: false }).limit(5000),
      context.supabase.from("leads").select("id", { count: "exact", head: true }),
      context.supabase.from("funnel_events").select("event").limit(10000),
    ]);
    const orders = ordersRes.data ?? [];
    const paid = orders.filter((o) => o.status === "paid").length;
    const failed = orders.filter((o) => o.status === "failed").length;
    const pending = orders.filter((o) => o.status === "pending").length;
    const events = eventsRes.data ?? [];
    const eventCounts = events.reduce<Record<string, number>>((acc, e) => {
      acc[e.event] = (acc[e.event] ?? 0) + 1;
      return acc;
    }, {});
    return {
      orders: { total: orders.length, paid, failed, pending },
      leads: leadsRes.count ?? 0,
      events: eventCounts,
    };
  });
