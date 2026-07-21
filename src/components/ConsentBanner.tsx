// src/components/ConsentBanner.tsx
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { detectBot } from "@/client-bot-detector";

declare global {
  interface Window {
    ym?: (...args: any[]) => void;
  }
}

export function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasConsent = localStorage.getItem("privacy_consent");
    
    if (!hasConsent) {
      setShow(true);
    } else {
      // Если согласие уже есть, тихо запускаем антифрод и затем метрику
      runAntiFraudAndMetrika();
    }
  }, []);

  const injectYandexMetrika = () => {
    if (document.getElementById("yandex-metrika")) return;

    // Внедряем основной скрипт
    const script = document.createElement("script");
    script.id = "yandex-metrika";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      (function(m,e,t,r,i,k,a){
          m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
      })(window, document,'script','[https://mc.yandex.ru/metrika/tag.js?id=110892673](https://mc.yandex.ru/metrika/tag.js?id=110892673)', 'ym');

      ym(110892673, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
    `;
    document.head.appendChild(script);

    // Добавляем noscript fallback
    const noscriptDiv = document.createElement("noscript");
    noscriptDiv.id = "yandex-metrika-noscript";
    noscriptDiv.innerHTML = `<div><img src="[https://mc.yandex.ru/watch/110892673](https://mc.yandex.ru/watch/110892673)" style="position:absolute; left:-9999px;" alt="" /></div>`;
    document.body.appendChild(noscriptDiv);
  };

  const runAntiFraudAndMetrika = async () => {
    try {
      // 1. Проверяем пользователя антифродом
      const botResult = await detectBot();

      // 2. Отправляем результат
      await fetch("/api/track-pageview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bot_score: botResult.score, 
          bot_level: botResult.level,
          signals: botResult.signals
        }),
      });

      // 3. Запускаем Метрику только после прохождения антифрода
      injectYandexMetrika();
    } catch (err) {
      console.error("Antifraud script failed:", err);
    }
  };

  const handleAccept = () => {
    localStorage.setItem("privacy_consent", "true");
    setShow(false);
    runAntiFraudAndMetrika();
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card p-4 shadow-2xl md:p-6 animate-in slide-in-from-bottom-full">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Мы используем файлы cookie и собираем технические данные устройства 
          для защиты от фрода и спама. Продолжая использовать сайт, вы соглашаетесь с{" "}
          <Link className="text-primary underline hover:text-foreground transition-colors" to="/privacy">
            Политикой конфиденциальности
          </Link>.
        </p>
        <button
          onClick={handleAccept}
          className="whitespace-nowrap rounded-2xl bg-primary px-7 py-3 text-sm font-medium text-primary-foreground transition hover:brightness-105"
        >
          Принимаю
        </button>
      </div>
    </div>
  );
}
