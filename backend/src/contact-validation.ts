// backend/src/contact-validation.ts
// Локальные эвристики для проверки контактов.
// Не использует платные внешние API. Проверяет форматы, списки одноразовых почт и делает запрос MX через DNS-over-HTTPS.

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "tempmail.com", "temp-mail.org", "temp-mail.io", "10minutemail.com",
  "guerrillamail.com", "sharklasers.com", "yopmail.com", "throwawaymail.com", "trashmail.com",
  "getnada.com", "maildrop.cc", "dispostable.com", "fakeinbox.com", "mytemp.email",
  "mohmal.com", "emailondeck.com", "moakt.com", "tempr.email", "spambox.us",
  "mail.tm", "inboxbear.com", "temp-inbox.me", "tempmailo.com", "1secmail.com",
  "internxt.com", "burnermail.io", "dropmail.me", "mail-temp.com", "nada.email",
]);

const POPULAR_DOMAINS = new Set([
  "gmail.com", "yandex.ru", "yandex.com", "ya.ru", "mail.ru", "bk.ru", "list.ru", "inbox.ru",
  "rambler.ru", "outlook.com", "hotmail.com", "live.com", "icloud.com", "me.com",
  "proton.me", "protonmail.com", "gmx.com", "gmx.de", "yahoo.com", "aol.com",
]);

export type ContactSignal = {
  key: string;
  label: string;
  ok: boolean;
  weight: number;
};

export type ContactScore = {
  score: number; // 0..100
  signals: ContactSignal[];
};

// --- Phone ---
function normalizePhone(raw: string): string {
  return raw.replace(/[^\d]/g, "");
}

function isRepetitive(digits: string): boolean {
  if (digits.length < 6) return true;
  if (/^(\d)\1+$/.test(digits)) return true;
  if ("01234567890".includes(digits) || "09876543210".includes(digits)) return true;
  const uniq = new Set(digits.split(""));
  if (uniq.size <= 3) return true;

  // Повторения паттернов: 121212, 123123
  if (/^(\d{1,3})\1{2,}$/.test(digits)) return true;
  // Повторения цифры (>=5)
  if (/(\d)\1{4,}$/.test(digits)) return true;
  // Хвост из нулей/единиц 0000/1111 в конце
  if (/(\d)\1{3,}/.test(digits)) return true;

  return false;
}

function phoneSignals(raw: string): ContactSignal[] {
  const digits = normalizePhone(raw);
  const signals: ContactSignal[] = [];

  const hasLen = digits.length >= 10 && digits.length <= 15;
  signals.push({ key: "phone_length", label: "Длина номера", ok: hasLen, weight: 10 });

  let ruMobile = false;
  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) {
    ruMobile = digits[1] === "9";
  } else if (digits.length === 10 && digits.startsWith("9")) {
    ruMobile = true;
  }
  signals.push({ key: "phone_ru_mobile", label: "Код оператора (+7 9XX)", ok: ruMobile, weight: 15 });

  const notRepeat = !isRepetitive(digits);
  signals.push({ key: "phone_not_repetitive", label: "Уникальность цифр", ok: notRepeat, weight: 25 });

  // Если мобильный РФ (начинается на +7), проверяем, что код не из тестовых диапазонов
  let realOperator = ruMobile;
  if (ruMobile && digits.length >= 11) {
    const opCode = digits.startsWith("9") ? digits.slice(0, 3) : digits.slice(1, 4);
    // Исключаем тестовые/специальные
    const bad = new Set(["900", "999", "911", "912"]);
    if (bad.has(opCode)) realOperator = false;
  }
  signals.push({ key: "phone_real_operator", label: "Реальный DEF-код", ok: realOperator, weight: 10 });

  return signals;
}

// --- Email ---
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function hasMxRecord(domain: string): Promise<boolean> {
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`, {
      headers: { accept: "application/dns-json" },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return false;
    const data = await res.json() as { Answer?: Array<{ type: number; data: string }>; Status?: number };
    if (data.Status !== 0) return false;
    return Array.isArray(data.Answer) && data.Answer.some((a) => a.type === 15);
  } catch {
    return false;
  }
}

function looksGibberish(s: string): boolean {
  if (!s) return true;
  const low = s.toLowerCase();
  // Клавиатурные паттерны
  const kbd = ["qwerty", "asdf", "zxcv", "qazwsx", "12345", "йцукен", "фыва", "ячсм"];
  if (kbd.some((k) => low.includes(k))) return true;

  // Нет гласных букв
  if (/[bcdfghjklmnpqrstvwxz ]{5,}/i.test(low)) return true;

  // Одна буква повторяется >=4 раза
  if (/(.)\1{3,}/.test(low)) return true;

  // Мало гласных для длинных слов >=5
  const letters = low.replace(/[^a-zа-я ]/gi, "");
  if (letters.length >= 5) {
    const vowels = (letters.match(/[aeiouyаеёиоуыэюя ]/gi) ?? []).length;
    if (vowels / letters.length < 0.15) return true;
  }

  return false;
}

async function emailSignals(raw: string): Promise<ContactSignal[]> {
  const email = raw.trim().toLowerCase();
  const signals: ContactSignal[] = [];

  const formatOk = EMAIL_RE.test(email);
  signals.push({ key: "email_format", label: "Синтаксис e-mail", ok: formatOk, weight: 5 });

  const domain = formatOk ? email.split("@")[1] : "";

  const notDisposable = !!domain && !DISPOSABLE_DOMAINS.has(domain);
  signals.push({ key: "email_not_disposable", label: "Не одноразовая почта", ok: notDisposable, weight: 15 });

  const local = formatOk ? email.split("@")[0] : "";
  const notRoleAddr = !!local && !["info", "admin", "test", "noreply", "no-reply", "support"].includes(local);
  signals.push({ key: "email_not_role", label: "Личный ящик (не info@, admin@)", ok: notRoleAddr, weight: 5 });

  const localOk = !!local && !looksGibberish(local) && local.length >= 3;
  signals.push({ key: "email_local_meaningful", label: "Осмысленный логин", ok: localOk, weight: 15 });

  const popular = !!domain && POPULAR_DOMAINS.has(domain);
  let mxOk = popular;
  if (!mxOk && formatOk && domain) {
    mxOk = await hasMxRecord(domain);
  }
  signals.push({ key: "email_mx", label: "Наличие домена (MX-запись)", ok: mxOk, weight: 15 });

  return signals;
}

// --- Name ---
function nameSignals(raw: string): ContactSignal[] {
  const name = raw.trim();
  const hasLetters = /[\p{L}]{2,}/u.test(name);
  const notOnlyDigits = !/^\d+$/.test(name);
  const okLen = name.length >= 2 && name.length <= 60;
  const basicOk = hasLetters && notOnlyDigits && okLen;

  const notGibberish = basicOk && !looksGibberish(name);

  // Тестовые слова
  const low = name.toLowerCase();
  const testWords = ["test", "тест", "asdf", "qwerty", "иванов", "ivanov", "user", "admin", "пользователь", "заявка"];
  const notTest = !testWords.some((w) => low.includes(w));

  return [
    { key: "name_basic", label: "Осмысленное имя", ok: basicOk, weight: 5 },
    { key: "name_not_gibberish", label: "Нет случайного набора букв", ok: notGibberish, weight: 15 },
    { key: "name_not_test", label: "Реальное имя (не test, asdf, и т.д.)", ok: notTest, weight: 10 },
  ];
}

export async function scoreContact(input: { name: string; phone: string; email?: string | null }): Promise<ContactScore> {
  const signals: ContactSignal[] = [];

  signals.push(...phoneSignals(input.phone));
  signals.push(...nameSignals(input.name));

  if (input.email && input.email.trim().length > 0) {
    signals.push(...await emailSignals(input.email));
  } else {
    // Если email не передан, мы не штрафуем пользователя полностью, но он не получит эти баллы
    signals.push({ key: "email_missing", label: "E-mail не указан", ok: false, weight: 0 });
  }

  const totalWeight = signals.reduce((a, s) => a + s.weight, 0);
  const gained = signals.reduce((a, s) => a + (s.ok ? s.weight : 0), 0);
  const score = totalWeight > 0 ? Math.round((gained / totalWeight) * 100) : 0;

  return { score, signals };
}