import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  adminListLeads,
  adminUpdateLead,
  LEAD_STATUSES,
  type LeadStatus,
} from "@/lib/admin.functions";
import { Download, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/leads")({
  component: AdminLeads,
});

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  won: "Успех",
  lost: "Отказ",
};

const STATUS_TONE: Record<LeadStatus, string> = {
  new: "bg-primary/15 text-primary",
  in_progress: "bg-amber-500/15 text-amber-600",
  won: "bg-emerald-500/15 text-emerald-600",
  lost: "bg-muted text-muted-foreground",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtMoney(kop: number | null | undefined) {
  if (!kop) return "";
  return (kop / 100).toLocaleString("ru-RU") + " ₽";
}

function toCsv(rows: any[]) {
  const cols = [
    "created_at",
    "status",
    "name",
    "email",
    "phone",
    "telegram",
    "source",
    "interest",
    "product_id",
    "amount_kopecks",
    "admin_notes",
  ];
  const esc = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join(
    "\n",
  );
}

function AdminLeads() {
  const list = useServerFn(adminListLeads);
  const update = useServerFn(adminUpdateLead);
  const qc = useQueryClient();

  const [status, setStatus] = useState<string>("all");
  const [source, setSource] = useState<string>("all");
  const [interest, setInterest] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["admin-leads", status, source, interest, search, from, to],
    queryFn: () =>
      list({
        data: {
          status,
          source,
          interest,
          search: search.trim() || undefined,
          from: from ? new Date(from).toISOString() : undefined,
          to: to ? new Date(to + "T23:59:59").toISOString() : undefined,
        },
      }),
  });

  const rows = (data ?? []) as any[];

  const { sources, interests } = useMemo(() => {
    const s = new Set<string>();
    const i = new Set<string>();
    rows.forEach((r) => {
      if (r.source) s.add(r.source);
      if (r.interest) i.add(r.interest);
    });
    return { sources: Array.from(s).sort(), interests: Array.from(i).sort() };
  }, [rows]);

  async function setStatusFor(id: string, s: LeadStatus) {
    await update({ data: { id, status: s } });
    qc.invalidateQueries({ queryKey: ["admin-leads"] });
    qc.invalidateQueries({ queryKey: ["admin-lead-stats"] });
  }

  async function saveNotes(id: string) {
    const val = notesDraft[id] ?? "";
    await update({ data: { id, admin_notes: val } });
    setNotesDraft((d) => {
      const { [id]: _, ...rest } = d;
      return rest;
    });
    qc.invalidateQueries({ queryKey: ["admin-leads"] });
  }

  function downloadCsv() {
    const csv = toCsv(rows);
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-6">
          <div className="md:col-span-2 relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск: имя, email, телефон"
              className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="all">Все статусы</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="all">Все источники</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="all">Все интересы</option>
            {interests.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-2 py-2 text-sm"
            />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-2 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <div>
            Показано: <b className="text-foreground">{rows.length}</b>
          </div>
          <button
            onClick={downloadCsv}
            disabled={rows.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:border-primary hover:text-primary disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            Экспорт CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-muted-foreground">
            <tr>
              <th className="text-left px-3 py-2">Дата</th>
              <th className="text-left px-3 py-2">Статус</th>
              <th className="text-left px-3 py-2">Имя</th>
              <th className="text-left px-3 py-2">Контакт</th>
              <th className="text-left px-3 py-2">Интерес</th>
              <th className="text-left px-3 py-2">Сумма</th>
              <th className="text-left px-3 py-2">Источник</th>
              <th className="text-left px-3 py-2">Заметки</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                  Загрузка…
                </td>
              </tr>
            )}
            {!isLoading &&
              rows.map((l) => {
                const s = (l.status ?? "new") as LeadStatus;
                const noteVal = notesDraft[l.id] ?? l.admin_notes ?? "";
                const noteDirty = notesDraft[l.id] !== undefined;
                return (
                  <tr key={l.id} className="border-t border-border align-top">
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground">
                      {fmtDate(l.created_at)}
                    </td>
                    <td className="px-3 py-2">
                      <div className={`inline-block rounded-full px-2 py-0.5 text-[11px] ${STATUS_TONE[s]}`}>
                        {STATUS_LABELS[s]}
                      </div>
                      <select
                        value={s}
                        onChange={(e) => setStatusFor(l.id, e.target.value as LeadStatus)}
                        className="mt-1 block w-full rounded border border-border bg-background px-1 py-0.5 text-[11px]"
                      >
                        {LEAD_STATUSES.map((ss) => (
                          <option key={ss} value={ss}>
                            {STATUS_LABELS[ss]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">{l.name ?? "—"}</td>
                    <td className="px-3 py-2">
                      <div>
                        <a
                          href={`mailto:${l.email}`}
                          className="text-primary hover:underline"
                        >
                          {l.email}
                        </a>
                      </div>
                      {l.phone && (
                        <div className="text-xs text-muted-foreground">{l.phone}</div>
                      )}
                      {l.telegram && (
                        <div className="text-xs text-muted-foreground">tg: {l.telegram}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <div>{l.interest ?? "—"}</div>
                      {l.product_id && (
                        <div className="text-muted-foreground">{l.product_id}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {fmtMoney(l.amount_kopecks)}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {l.source ?? "—"}
                    </td>
                    <td className="px-3 py-2 min-w-[220px]">
                      <textarea
                        rows={2}
                        value={noteVal}
                        onChange={(e) =>
                          setNotesDraft((d) => ({ ...d, [l.id]: e.target.value }))
                        }
                        placeholder="Заметка…"
                        className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
                      />
                      {noteDirty && (
                        <button
                          onClick={() => saveNotes(l.id)}
                          className="mt-1 rounded bg-primary px-2 py-0.5 text-[11px] text-primary-foreground"
                        >
                          Сохранить
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                  По этим фильтрам заявок нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
