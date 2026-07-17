// backend/src/server.ts
import express from 'express';
import crypto from 'crypto';
import db from './db';
import { hashIp, ipPrefix, maskIp, extractIp, parseUA, geoLookup, extractGeoFromHeaders } from './security';
import { checkAccess } from './access';
import { scoreContact } from './contact-validation';
import { runIpSync } from './ip-sync';

const app = express();
app.use(express.json());

// POST /api/submit-lead
app.post('/api/submit-lead', async (req, res) => {
    const data = req.body;
    const ip = extractIp(req);
    const ipH = hashIp(ip);
    const ipP = ipPrefix(ip);
    const ua = req.headers["user-agent"] || "";
    const headerGeo = extractGeoFromHeaders(req);

    try {
        // 1) IP ban check
        const wl = db.prepare("SELECT id FROM ip_whitelist WHERE ip_hash = ?").get(ipH);
        const isWhitelisted = !!wl;

        if (!isWhitelisted) {
            const ban = db.prepare("SELECT id, expires_at, hit_count FROM ip_bans WHERE ip_hash = ?").get(ipH) as any;
            if (ban && (!ban.expires_at || new Date(ban.expires_at) > new Date())) {
                db.prepare("UPDATE ip_bans SET hit_count = hit_count + 1 WHERE id = ?").run(ban.id);
                return res.status(403).json({ ok: false, error: "blocked" });
            }
        }

        // 1b) Geo/VPN access rules
        const access = await checkAccess(ip, headerGeo.country ?? null, ua);
        if (!isWhitelisted && !access.allowed) {
            return res.status(403).json({ ok: false, error: "blocked" });
        }

        // 2) Honeypot
        const spamReasons: string[] = [];
        if (data.hp_website || data.hp_company) spamReasons.push("honeypot");

        // 3) Timing
        const openedAt = data.formOpenedAt ?? 0;
        const now = Date.now();
        const fillMs = openedAt > 0 ? now - openedAt : 0;
        if (openedAt > 0 && fillMs < 2000) spamReasons.push("too_fast");

        // 4) Rate limit
        if (!isWhitelisted) {
            const since = new Date(now - 10 * 60 * 1000).toISOString();
            const countRow = db.prepare("SELECT count(id) as c FROM leads WHERE ip_hash = ? AND created_at >= ?").get(ipH, since) as any;
            if (countRow && countRow.c >= 5) spamReasons.push("rate_limit");
        }

        const isSpam = spamReasons.length > 0;

        // 5) Auto-ban
        if (!isWhitelisted && spamReasons.includes("honeypot")) {
            db.prepare(`
                INSERT INTO ip_bans (id, ip_hash, ip_prefix, reason, banned_by, expires_at, note)
                VALUES (?, ?, ?, 'auto: honeypot', 'system', ?, ?)
                ON CONFLICT(ip_hash) DO UPDATE SET expires_at=excluded.expires_at
            `).run(
                crypto.randomUUID(), ipH, ipP,
                new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString(),
                ip
            );
        }

        // 6) Geo cache
        let geo: { country?: string; region?: string; city?: string; isp?: string } = { ...headerGeo };
        if (!isSpam && !geo.country) {
            const cached = db.prepare("SELECT country, region, city, isp FROM geo_cache WHERE ip_hash = ?").get(ipH) as any;
            if (cached?.country) {
                geo = { ...cached };
            } else {
                const g = await geoLookup(ip);
                if (g?.country) {
                    geo = { ...g };
                    db.prepare("INSERT OR REPLACE INTO geo_cache (ip_hash, country, region, city, isp) VALUES (?, ?, ?, ?, ?)")
                      .run(ipH, g.country, g.region ?? null, g.city ?? null, g.isp ?? null);
                }
            }
        }

        // 8) Contact reality score
        let contactScore: number | null = null;
        let contactSignals: any = null;
        try {
            const res = await scoreContact({ name: data.name, phone: data.phone, email: data.email || null });
            contactScore = res.score;
            contactSignals = res.signals;
        } catch (e) {
            console.error("contact scoring failed", e);
        }

        // 9) Insert lead
        db.prepare(`
            INSERT INTO leads (id, ip_hash, name, phone, email, task, is_spam, spam_reason)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            crypto.randomUUID(), ipH, data.name, data.phone, data.email || null, data.task || null,
            isSpam ? 1 : 0, spamReasons.join(",") || null
        );

        return res.json({ ok: true, spam: isSpam });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, error: "server" });
    }
});

// POST /api/track-pageview
app.post('/api/track-pageview', async (req, res) => {
    const data = req.body;
    const ip = extractIp(req);
    const ipH = hashIp(ip);
    const ua = req.headers["user-agent"] || "";
    const headerGeo = extractGeoFromHeaders(req);

    try {
        const ban = db.prepare("SELECT id, expires_at FROM ip_bans WHERE ip_hash = ?").get(ipH) as any;
        if (ban && (!ban.expires_at || new Date(ban.expires_at) > new Date())) {
            return res.json({ ok: false });
        }

        let geo: { country?: string; region?: string; city?: string; isp?: string } = { ...headerGeo };
        if (!geo.country) {
            const cached = db.prepare("SELECT country, region, city, isp FROM geo_cache WHERE ip_hash = ?").get(ipH) as any;
            if (cached?.country) {
                geo = { ...cached };
            } else {
                const g = await geoLookup(ip);
                if (g?.country) {
                    geo = { ...g };
                    db.prepare("INSERT OR REPLACE INTO geo_cache (ip_hash, country, region, city, isp) VALUES (?, ?, ?, ?, ?)")
                      .run(ipH, g.country, g.region ?? null, g.city ?? null, g.isp ?? null);
                }
            }
        }

        await checkAccess(ip, geo.country ?? null, ua);

        db.prepare("INSERT INTO page_views (ip_hash) VALUES (?)").run(ipH);

        return res.json({ ok: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false });
    }
});

// POST /api/cron/sync-ips
app.post('/api/cron/sync-ips', async (req, res) => {
    const secret = process.env.IP_SYNC_SECRET ?? "";
    const provided = req.headers["x-sync-secret"] ?? "";
    if (!secret || provided !== secret) {
        return res.status(401).send("Unauthorized");
    }
    const result = await runIpSync();
    return res.status(result.ok ? 200 : 500).json(result);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Antifraud standalone service running on port ${PORT}`);
});
