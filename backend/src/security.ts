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
    const res = await fetch(`[https://ipwho.is/$](https://ipwho.is/$){encodeURIComponent(ip)}?fields=success,country,region,city,connection`, {
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
