// src/lib/admin.functions.ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const LEAD_STATUSES = ["new", "in_progress", "won", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const adminListOrders = createServerFn({ method: "GET" })
  .handler(async () => {
    return []; // Пустой массив заказов
  });

export const adminUpdateOrderStatus = createServerFn({ method: "POST" })
  .handler(async () => {
    return { ok: true };
  });

export const adminListLeads = createServerFn({ method: "GET" })
  .handler(async () => {
    return []; // Пустой массив лидов
  });

export const adminUpdateLead = createServerFn({ method: "POST" })
  .handler(async () => {
    return { ok: true };
  });

export const adminLeadStats = createServerFn({ method: "GET" })
  .handler(async () => {
    return { newCount: 0, total: 0 };
  });

export const adminFunnelSummary = createServerFn({ method: "GET" })
  .handler(async () => {
    return {
      orders: { total: 0, paid: 0, failed: 0, pending: 0 },
      leads: 0,
      events: {},
    };
  });
