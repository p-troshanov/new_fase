// frontend/src/client-bot-detector.ts
// Возвращает bot_score (0..100) на уровне page-view.
// Сигнатуры:
//  1. navigator.webdriver (100% бот)
//  2. Отсутствие navigator.languages
//  3. Отсутствие window.chrome / аномалии permissions API (headless-Chrome)
//  4. Canvas / WebGL fingerprint (недоступен у headless)
//  5. Плагины
//  6. 0 активности
//  7. Слабое hardware (cores, memory, отсутствие touch)
//  8. Несоответствие таймзоны

export type BotSignal = { key: string; label: string; hit: boolean; weight: number };
export type BotResult = {
  score: number; // 0..100, где 100 - точно бот
  level: "human" | "maybe_bot" | "suspicious" | "likely_bot" | "definite_bot";
  signals: BotSignal[];
};

function scoreToLevel(score: number): BotResult["level"] {
  if (score >= 80) return "definite_bot";
  if (score >= 60) return "likely_bot";
  if (score >= 40) return "suspicious";
  if (score >= 20) return "maybe_bot";
  return "human";
}

function safe<T>(fn: () => T, fallback: T): T {
  try { return fn(); } catch { return fallback; }
}

function hashString(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

function canvasFingerprint(): string {
  return safe(() => {
    const c = document.createElement("canvas");
    c.width = 200; c.height = 50;
    const ctx = c.getContext("2d");
    if (!ctx) return "no-ctx";
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#f60";
    ctx.fillRect(0, 0, 100, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("Metallstandart защита", 2, 15);
    ctx.strokeStyle = "rgba(102,204,0,0.7)";
    ctx.strokeRect(80, 5, 40, 30);
    return hashString(c.toDataURL());
  }, "err");
}

function webglVendor(): string {
  return safe(() => {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl") || c.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return "";
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    if (!dbg) return "";
    const v = gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL);
    const r = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
    return `${v}|${r}`;
  }, "");
}

// Запускаем сбор сигнатур. Ждем 2.5 сек на странице (или меньше), чтобы успеть поймать движения мыши.
export async function detectBot(observeMs = 2500): Promise<BotResult> {
  const nav = navigator;
  const win = window as unknown as Record<string, unknown>;

  let mouseMoves = 0;
  let scrolls = 0;
  let keys = 0;
  const onMouse = () => { mouseMoves++; };
  const onScroll = () => { scrolls++; };
  const onKey = () => { keys++; };
  window.addEventListener("mousemove", onMouse, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("keydown", onKey, { passive: true });

  await new Promise((r) => setTimeout(r, observeMs));

  window.removeEventListener("mousemove", onMouse);
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("keydown", onKey);

  const signals: BotSignal[] = [];

  // 1. WebDriver
  const wd = safe(() => (nav as Navigator & { webdriver?: boolean }).webdriver === true, false);
  signals.push({ key: "webdriver", label: "navigator.webdriver = true", hit: wd, weight: 30 });

  // 2. Отсутствие languages
  const langs = safe(() => Array.isArray(nav.languages) ? nav.languages.length : 0, 0);
  signals.push({ key: "no_languages", label: "Пустой navigator.languages", hit: langs === 0, weight: 10 });

  // 3. Отсутствие плагинов (характерно для headless)
  const pluginCount = safe(() => nav.plugins?.length ?? 0, 0);
  signals.push({ key: "no_plugins", label: "0 в navigator.plugins", hit: pluginCount === 0, weight: 5 });

  // 4. HeadlessChrome юзерагент
  const ua = nav.userAgent || "";
  const headlessUA = /headless|phantomjs|puppeteer|playwright|selenium/i.test(ua);
  signals.push({ key: "headless_ua", label: "Headless-токен в User-Agent", hit: headlessUA, weight: 25 });

  // 5. Отсутствие window.chrome (если Chrome и не headless — объект должен быть)
  const isChromeUA = /Chrome\//i.test(ua) && !/Edg\/|OPR\//i.test(ua);
  const hasChromeObj = "chrome" in win && !!win.chrome;
  signals.push({
    key: "chrome_missing", label: "Chrome UA без window.chrome",
    hit: isChromeUA && !hasChromeObj, weight: 15,
  });

  // 6. Permissions API аномалия (headless Chrome возвращает Notification.permission='denied' при state='prompt')
  let permAnomaly = false;
  try {
    if (nav.permissions && "Notification" in window) {
      const p = await nav.permissions.query({ name: "notifications" as PermissionName });
      const notifPerm = safe(() => Notification.permission, "default");
      permAnomaly = p.state === "prompt" && notifPerm === "denied";
    }
  } catch { /* ignore */ }
  signals.push({ key: "perm_anomaly", label: "Аномалия Permissions API", hit: permAnomaly, weight: 15 });

  // 7. Нет активности
  const noActivity = mouseMoves === 0 && scrolls === 0 && keys === 0;
  signals.push({ key: "no_activity", label: "Нет активности юзера", hit: noActivity, weight: 10 });

  // 8. Слабое железо: 0-1 ядро и нет touch (характерно для дешевых VDS)
  const cores = safe(() => nav.hardwareConcurrency ?? 0, 0);
  const hasTouch = "ontouchstart" in window || (nav.maxTouchPoints ?? 0) > 0;
  const weakHw = cores <= 1 && !hasTouch;
  signals.push({ key: "weak_hardware", label: "Слабое железо, нет touch (VDS/Скрипт)", hit: weakHw, weight: 10 });

  // 9. Таймзона: RU язык, но не Europe/*)
  const tz = safe(() => Intl.DateTimeFormat().resolvedOptions().timeZone, "");
  const lang = safe(() => (nav.language || "").toLowerCase(), "");
  const ruLang = lang.startsWith("ru");
  const ruTz = /Europe\/|Asia\/(Yekaterinburg|Novosibirsk|Krasnoyarsk|Irkutsk|Yakutsk|Vladivostok|Magadan|Kamchatka)/.test(tz);
  const tzMismatch = ruLang && tz.length > 0 && !ruTz;
  signals.push({ key: "tz_mismatch", label: "Несоответствие гео/таймзоны", hit: tzMismatch, weight: 15 });

  // 10. Canvas / WebGL fingerprint недоступен
  const canvas = canvasFingerprint();
  const canvasBad = canvas === "err" || canvas === "no-ctx" || canvas.length < 4;
  signals.push({ key: "canvas_bad", label: "Canvas fingerprint недоступен", hit: canvasBad, weight: 10 });

  const gl = webglVendor();
  const webglMissing = gl === "" || /swiftshader|llvmpipe|virtualbox|vmware/i.test(gl);
  signals.push({ key: "webgl_missing", label: "WebGL софтверный/отсутствует", hit: webglMissing, weight: 10 });

  // 11. Маленький экран (0x0 / 1x1)
  const sw = safe(() => screen.width, 0);
  const sh = safe(() => screen.height, 0);
  const badScreen = sw < 200 || sh < 200;
  signals.push({ key: "bad_screen", label: "Слишком маленький экран", hit: badScreen, weight: 10 });

  const totalWeight = signals.reduce((a, s) => a + s.weight, 0);
  const hitWeight = signals.reduce((a, s) => a + (s.hit ? s.weight : 0), 0);
  const score = totalWeight > 0 ? Math.round((hitWeight / totalWeight) * 100) : 0;

  return { score, level: scoreToLevel(score), signals };
}