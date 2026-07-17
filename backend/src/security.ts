// backend/src/security.ts
import { createHash, timingSafeEqual } from "node:crypto";
import { UAParser } from "ua-parser-js";

const SALT = process.env.IP_HASH_SALT ?? "dev-salt-change-me";

export function hashIp(ip: string): string {
  return createHash("sha256").update(SALT + ":" + ip).digest("hex");
}

export function ipPrefix(ip: string): string | null {
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length !== 4) return null;
    return parts.slice(0, 3).join(".") + ".0/24";
  }
  if (ip.includes(":")) {
    const parts = ip.split(":");
    return parts.slice(0, 3).join(":") + "::/48";
  }
  return null;
}

export function maskIp(ip: string): string {
  if (!ip) return "";
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) return parts.slice(0, 3).join(".") + ".***";
    return ip;
  }
  if (ip.includes(":")) {
    const parts = ip.split(":");
    return parts.slice(0, 3).join(":") + "::***";
  }
  return ip;
}

export function extractIp(request: any): string {
  // Адаптировано под Express Request
  const cf = request.headers["cf-connecting-ip"] || request.headers["x-forwarded-for"];
  if (cf) return (Array.isArray(cf) ? cf[0] : cf).split(',')[0].trim();
  return request.ip || "0.0.0.0";
}

export type UAInfo = {
  device: string;
  os: string;
  os_version: string;
  browser: string;
  browser_version: string;
  device_vendor: string;
  device_model: string;
};

export function parseUA(ua: string): UAInfo {
  try {
    const p = new UAParser(ua).getResult();
    const rawType = p.device.type;
    const device = rawType === "mobile" ? "mobile" : rawType === "tablet" ? "tablet" : rawType ? rawType : "desktop";
    return {
      device,
      os: p.os.name ?? "unknown",
      os_version: p.os.version ?? "",
      browser: p.browser.name ?? "unknown",
      browser_version: (p.browser.version ?? "").split(".")[0] || "",
      device_vendor: p.device.vendor ?? "",
      device_model: p.device.model ?? "",
    };
  } catch {
    return { device: "desktop", os: "unknown", os_version: "", browser: "unknown", browser_version: "", device_vendor: "", device_model: "" };
  }
}

const BOT_RE = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot|vkshare|yandeximages|yandexbot|googlebot|http[-_]?client|python-requests|libwww|curl\/|wget\/|java\/|okhttp/i;
export function isBotUA(ua: string): boolean {
  return BOT_RE.test(ua);
}

export type BotCategory = "search" | "ai" | "social" | "monitoring" | "headless" | "other" | null;

const SEARCH_RE = /googlebot|storebot-google|adsbot-google|mediapartners-google|bingbot|bingpreview|slurp|duckduckbot|duckduckgo-favicons|yandex(bot|images|video|metrika)|baiduspider|sogou|exabot|mail\.ru_bot|seznambot|petalbot|applebot|naverbot|yeti/i;
const AI_RE = /gptbot|chatgpt-user|oai-searchbot|claudebot|claude-web|anthropic-ai|perplexitybot|perplexity-user|ccbot|google-extended|bytespider|amazonbot|cohere-ai|youbot|diffbot|meta-externalagent|img2dataset/i;
const SOCIAL_RE = /facebookexternalhit|facebookcatalog|meta-externalfetcher|twitterbot|linkedinbot|slackbot|discordbot|telegrambot|whatsapp|viberbot|skypeuripreview|vkshare|pinterest|redditbot|tumblr/i;
const MONITORING_RE = /ahrefsbot|semrushbot|mj12bot|dotbot|rogerbot|screaming\s?frog|sitebulb|seokicks|blexbot|dataforseobot|serpstatbot|uptimerobot|pingdom|statuscake|newrelic|datadog|site24x7|linkchecker|nutch|zoominfobot|barkrowler|megaindex|serpapi/i;
const HEADLESS_RE = /headlesschrome|puppeteer|playwright|phantomjs|selenium|nightmare|cypress|chromedriver|geckodriver|webdriver|python-requests|python-urllib|scrapy|http[-_]?client|libwww-perl|okhttp|apache-httpclient|java\/|go-http-client|node-fetch|axios\/|got\/|curl\/|wget\/|postmanruntime|insomnia/i;

export function classifyBot(ua: string): { isBot: boolean; category: BotCategory; isHeadless: boolean } {
  const s = ua || "";
  if (!s) return { isBot: false, category: null, isHeadless: false };
  const isHeadless = HEADLESS_RE.test(s);

  if (SEARCH_RE.test(s)) return { isBot: true, category: "search", isHeadless: false };
  if (AI_RE.test(s)) return { isBot: true, category: "ai", isHeadless: false };
  if (SOCIAL_RE.test(s)) return { isBot: true, category: "social", isHeadless: false };
  if (MONITORING_RE.test(s)) return { isBot: true, category: "monitoring", isHeadless };
  if (isHeadless) return { isBot: true, category: "headless", isHeadless: true };
  if (BOT_RE.test(s)) return { isBot: true, category: "other", isHeadless: false };

  return { isBot: false, category: null, isHeadless: false };
}

export function osFamily(os: string | null | undefined): string {
  const s = (os ?? "").toLowerCase();
  if (!s || s === "unknown") return "other";
  if (s.includes("android")) return "Android";
  if (s.includes("ios") || s.includes("iphone") || s.includes("ipad") || s.includes("ipod")) return "iOS";
  if (s.includes("mac")) return "macOS";
  if (s.includes("windows")) return "Windows";
  if (s.includes("chrome os") || s.includes("chromium os")) return "ChromeOS";
  if (s.includes("linux") || s.includes("ubuntu") || s.includes("debian") || s.includes("fedora") || s.includes("centos") || s.includes("arch")) return "Linux";
  if (s.includes("freebsd") || s.includes("openbsd") || s.includes("netbsd")) return "BSD";
  return "other";
}

export function extractGeoFromHeaders(request: any): { country?: string; region?: string; city?: string } {
  const country = request.headers["cf-ipcountry"] || request.headers["x-vercel-ip-country"] || undefined;
  const region = request.headers["cf-region"] || request.headers["x-vercel-ip-country-region"] || undefined;
  const city = request.headers["cf-ipcity"] || request.headers["x-vercel-ip-city"] || undefined;
  const clean = (v?: string | string[]) => {
      const val = Array.isArray(v) ? v[0] : v;
      return (val && val !== "XX" && val !== "T1" ? decodeURIComponent(val) : undefined);
  };
  return { country: clean(country), region: clean(region), city: clean(city) };
}

export async function geoLookup(ip: string): Promise<{ country?: string; region?: string; city?: string; isp?: string } | null> {
  if (!ip || ip === "0.0.0.0" || ip.startsWith("127.") || ip.startsWith("10.") || ip.startsWith("192.168.")) return null;
  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}?fields=success,country,region,city,connection`, {
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { success?: boolean; country?: string; region?: string; city?: string; connection?: { isp?: string } };
    if (!data.success) return null;
    return { country: data.country, region: data.region, city: data.city, isp: data.connection?.isp };
  } catch {
    return null;
  }
}

```

### `backend/src/access.ts`
```ts
// backend/src/access.ts
import db from './db';
import { classifyBot, type BotCategory, hashIp, ipPrefix } from "./security";

export type AccessCheck = {
  allowed: boolean;
  country: string | null;
  is_vpn: boolean;
  is_datacenter: boolean;
  is_tor: boolean;
  bot_category: BotCategory;
  is_headless: boolean;
  reason: string | null;
  rule_detail: string | null;
  message: string;
};

type Rules = {
  mode: "off" | "whitelist" | "blacklist";
  countries: string[];
  block_vpn: boolean;
  block_datacenter: boolean;
  block_tor: boolean;
  block_bad_bots: boolean;
  block_message: string;
  allow_user_agents: string[];
  allow_host_suffixes: string[];
};

let rulesCache: { at: number; rules: Rules } | null = null;
const RULES_TTL_MS = 30_000;

async function loadRules(): Promise<Rules> {
  const now = Date.now();
  if (rulesCache && now - rulesCache.at < RULES_TTL_MS) return rulesCache.rules;

  const data = db.prepare("SELECT * FROM access_rules WHERE id = 1").get() as any;

  const rules: Rules = {
    mode: data?.mode ?? "off",
    countries: data?.countries ? JSON.parse(data.countries) : [],
    block_vpn: Boolean(data?.block_vpn),
    block_datacenter: Boolean(data?.block_datacenter),
    block_tor: Boolean(data?.block_tor),
    block_bad_bots: Boolean(data?.block_bad_bots),
    block_message: data?.block_message ?? "",
    allow_user_agents: data?.allow_user_agents ? JSON.parse(data.allow_user_agents) : [],
    allow_host_suffixes: data?.allow_host_suffixes ? JSON.parse(data.allow_host_suffixes) : [],
  };
  rulesCache = { at: now, rules };
  return rules;
}

export function invalidateRulesCache() {
  rulesCache = null;
}

const catCache = new Map<string, { at: number; cats: string[] }>();
const CAT_TTL_MS = 60_000;

function ipToNum(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

async function ipCategories(ip: string): Promise<string[]> {
  if (!ip || ip === "0.0.0.0" || ip.startsWith("127.") || ip.startsWith("10.") || ip.startsWith("192.168.")) return [];
  const now = Date.now();
  const cached = catCache.get(ip);
  if (cached && now - cached.at < CAT_TTL_MS) return cached.cats;

  let cats: string[] = [];
  try {
      if (ip.includes(".")) { // IPv4
          const ranges = db.prepare("SELECT cidr, category FROM ip_ranges WHERE cidr LIKE '%/%' OR cidr LIKE '%.%'").all() as {cidr: string, category: string}[];
          const targetIp = ipToNum(ip);
          for (const r of ranges) {
              const [rangeIp, prefix] = r.cidr.split('/');
              if (!rangeIp.includes(".")) continue;
              const rangeMask = -1 << (32 - parseInt(prefix || '32', 10));
              if ((ipToNum(rangeIp) & rangeMask) === (targetIp & rangeMask)) {
                  cats.push(r.category);
              }
          }
      }
  } catch (e) {
      console.error(e);
  }

  if (catCache.size > 5000) catCache.clear();
  catCache.set(ip, { at: now, cats });
  return cats;
}

const ptrCache = new Map<string, { at: number; host: string | null }>();
const PTR_TTL_MS = 24 * 60 * 60 * 1000;

async function reverseDns(ip: string): Promise<string | null> {
  if (!ip || ip === "0.0.0.0") return null;
  const cached = ptrCache.get(ip);
  const now = Date.now();
  if (cached && now - cached.at < PTR_TTL_MS) return cached.host;

  let ptrName: string | null = null;
  try {
    if (ip.includes(".")) {
      const parts = ip.split(".");
      if (parts.length === 4) ptrName = parts.slice().reverse().join(".") + ".in-addr.arpa";
    } else if (ip.includes(":")) {
      ptrName = null;
    }

    if (!ptrName) {
      ptrCache.set(ip, { at: now, host: null });
      return null;
    }

    const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(ptrName)}&type=PTR`;
    const res = await fetch(url, {
      headers: { accept: "application/dns-json" },
      signal: AbortSignal.timeout(2500),
    });

    if (!res.ok) { ptrCache.set(ip, { at: now, host: null }); return null; }
    const j = (await res.json()) as { Answer?: Array<{ data?: string }> };
    const first = j.Answer?.find((a) => a.data)?.data ?? null;
    const host = first ? first.replace(/\.$/, "").toLowerCase() : null;

    if (ptrCache.size > 5000) ptrCache.clear();
    ptrCache.set(ip, { at: now, host });
    return host;
  } catch {
    ptrCache.set(ip, { at: now, host: null });
    return null;
  }
}

function uaMatches(ua: string, patterns: string[]): string | null {
  const s = ua.toLowerCase();
  for (const p of patterns) {
    const t = p.trim().toLowerCase();
    if (t && s.includes(t)) return p;
  }
  return null;
}

function hostMatches(host: string, suffixes: string[]): string | null {
  const h = host.toLowerCase();
  for (const s of suffixes) {
    const t = s.trim().toLowerCase().replace(/^\./, "");
    if (t && (h === t || h.endsWith("." + t))) return s;
  }
  return null;
}

function logBlockedAsync(payload: {
  ip: string;
  country: string | null;
  path: string | null;
  reason: string;
  rule_detail: string | null;
  bot_category: BotCategory;
  is_headless: boolean;
  user_agent: string;
}) {
  try {
      db.prepare(`
        INSERT INTO blocked_requests
        (ip_hash, ip_prefix, country, path, reason, rule_detail, bot_category, is_headless, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        payload.ip ? hashIp(payload.ip) : null,
        payload.ip ? ipPrefix(payload.ip) : null,
        payload.country,
        payload.path,
        payload.reason,
        payload.rule_detail,
        payload.bot_category,
        payload.is_headless ? 1 : 0,
        payload.user_agent?.slice(0, 500) ?? null
      );
  } catch(e) { }
}

export async function checkAccess(
  ip: string,
  country: string | null,
  ua: string = "",
  path: string | null = null,
): Promise<AccessCheck> {
  const rules = await loadRules();
  const cats = await ipCategories(ip);

  const is_vpn = cats.includes("vpn") || cats.includes("proxy");
  const is_datacenter = cats.includes("datacenter");
  const is_tor = cats.includes("tor");

  const bot = classifyBot(ua);

  // Allowlist по UA
  const uaHit = uaMatches(ua, rules.allow_user_agents);
  if (uaHit) {
    return {
      allowed: true, country, is_vpn, is_datacenter, is_tor,
      bot_category: bot.category, is_headless: bot.isHeadless,
      reason: null, rule_detail: `allowlist:ua "${uaHit}"`, message: rules.block_message,
    };
  }

  // Allowlist по Reverse-DNS
  if (rules.allow_host_suffixes.length > 0 && (bot.category === "search" || bot.category === "ai" || bot.category === "social" || bot.category === "monitoring" || bot.category === "other")) {
    const host = await reverseDns(ip);
    if (host) {
      const hit = hostMatches(host, rules.allow_host_suffixes);
      if (hit) {
        return {
          allowed: true, country, is_vpn, is_datacenter, is_tor,
          bot_category: bot.category, is_headless: bot.isHeadless,
          reason: null, rule_detail: `allowlist:host "${host}" (${hit})`, message: rules.block_message,
        };
      }
    }
  }

  let allowed = true;
  let reason: string | null = null;
  let rule_detail: string | null = null;

  if (rules.mode === "whitelist") {
    if (!country || !rules.countries.includes(country)) {
      allowed = false;
      reason = "country_not_whitelisted";
      rule_detail = `Страна "${country ?? "Неизвестно"}" не в whitelist (${rules.countries.length} стран разрешено)`;
    }
  } else if (rules.mode === "blacklist") {
    if (country && rules.countries.includes(country)) {
      allowed = false;
      reason = "country_blacklisted";
      rule_detail = `Страна "${country}" в blacklist`;
    }
  }

  if (allowed && rules.block_tor && is_tor) {
    allowed = false; reason = "tor"; rule_detail = "IP принадлежит Tor exit-nodes";
  }
  if (allowed && rules.block_vpn && is_vpn) {
    allowed = false; reason = "vpn"; rule_detail = `IP принадлежит ${cats.includes("vpn") ? "VPN" : "Прокси"} (Firehol/X4BNet)`;
  }
  if (allowed && rules.block_datacenter && is_datacenter) {
    allowed = false; reason = "datacenter"; rule_detail = "IP принадлежит дата-центру (Firehol/X4BNet)";
  }

  if (allowed && rules.block_bad_bots && (bot.category === "headless" || bot.category === "monitoring" || bot.isHeadless)) {
    allowed = false;
    reason = "bad_bot";
    rule_detail = bot.category === "monitoring"
      ? "SEO-мониторинг или парсер заблокирован"
      : "Headless-браузер или утилита заблокирована";
  }

  if (!allowed) {
    logBlockedAsync({
      ip, country, path,
      reason: reason ?? "unknown",
      rule_detail,
      bot_category: bot.category,
      is_headless: bot.isHeadless,
      user_agent: ua,
    });
  }

  return {
    allowed,
    country,
    is_vpn,
    is_datacenter,
    is_tor,
    bot_category: bot.category,
    is_headless: bot.isHeadless,
    reason,
    rule_detail,
    message: rules.block_message,
  };
}