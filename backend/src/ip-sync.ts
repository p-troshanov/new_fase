// backend/src/ip-sync.ts
import db from './db';
import fetch from 'node-fetch'; // Использование node-fetch, если версия Node < 18

type Source = {
  name: string;
  url: string;
  category: "vpn" | "datacenter" | "tor" | "proxy";
};

// Базы Firehol + X4BNet
const SOURCES: Source[] = [
  { name: "firehol_datacenters", url: "https://iplists.firehol.org/files/datacenters.netset", category: "datacenter" },
  { name: "firehol_anonymous", url: "https://iplists.firehol.org/files/firehol_anonymous.netset", category: "proxy" },
  { name: "firehol_tor", url: "https://iplists.firehol.org/files/tor_exits.netset", category: "tor" },
  { name: "x4bnet_vpn", url: "https://raw.githubusercontent.com/X4BNet/lists_vpn/main/output/vpn/ipv4.txt", category: "vpn" },
  { name: "x4bnet_datacenter", url: "https://raw.githubusercontent.com/X4BNet/lists_vpn/main/output/datacenter/ipv4.txt", category: "datacenter" },
];

const CIDR_RE = /^(?:\d{1,3}\.){3}\d{1,3}(?:\/\d{1,2})?$/;

function parseList(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.split("#")[0].trim();
    if (!line) continue;
    const cidr = line.includes("/") ? line : `${line}/32`;
    if (CIDR_RE.test(cidr)) out.push(cidr);
  }
  return out;
}

async function fetchSource(src: Source): Promise<{ src: Source; cidrs: string[]; error?: string }> {
  try {
    const res = await fetch(src.url, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) return { src, cidrs: [], error: `HTTP ${res.status}` };
    const text = await res.text();
    return { src, cidrs: parseList(text) };
  } catch (e) {
    return { src, cidrs: [], error: (e as Error).message };
  }
}

export async function runIpSync(): Promise<{ ok: boolean; total: number; sources: Record<string, number>; error?: string }> {
  const startedAt = new Date().toISOString();

  const logStmt = db.prepare("INSERT INTO ip_ranges_sync_log (started_at) VALUES (?)");
  const logInfo = logStmt.run(startedAt);
  const logId = logInfo.lastInsertRowid;

  try {
    const results = await Promise.all(SOURCES.map(fetchSource));
    const perSource: Record<string, number> = {};
    let total = 0;

    const upsertStmt = db.prepare(`
      INSERT INTO ip_ranges (cidr, category, source, synced_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(cidr) DO UPDATE SET
        category=excluded.category,
        source=excluded.source,
        synced_at=excluded.synced_at
    `);

    db.exec('BEGIN TRANSACTION');
    for (const r of results) {
      perSource[r.src.name] = r.cidrs.length;
      if (r.cidrs.length === 0) continue;

      const now = new Date().toISOString();
      for (const cidr of r.cidrs) {
        upsertStmt.run(cidr, r.src.category, r.src.name, now);
        total++;
      }
    }
    db.exec('COMMIT');

    db.prepare(`
      UPDATE ip_ranges_sync_log
      SET finished_at = ?, ok = 1, total_upserted = ?, sources = ?
      WHERE id = ?
    `).run(new Date().toISOString(), total, JSON.stringify(perSource), logId);

    return { ok: true, total, sources: perSource };
  } catch (e) {
    db.exec('ROLLBACK');
    const msg = (e as Error).message;
    db.prepare(`
      UPDATE ip_ranges_sync_log
      SET finished_at = ?, ok = 0, error = ?
      WHERE id = ?
    `).run(new Date().toISOString(), msg, logId);
    return { ok: false, total: 0, sources: {}, error: msg };
  }
}

if (require.main === module) {
  runIpSync().then(res => {
      console.log("IP Sync complete:", res);
  }).catch(console.error);
}