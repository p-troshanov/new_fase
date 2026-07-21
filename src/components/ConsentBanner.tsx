// src/components/ConsentBanner.tsx
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { detectBot } from "@/client-bot-detector";
import { ArrowRight, ShieldCheck } from "lucide-react";

declare global {
  interface Window {
    ym?: (...args: any[]) => void;
  }
}

export function ConsentBanner() {
  const [show, setShow] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const hasConsent = localStorage.getItem("privacy_consent");
    
    if (!hasConsent) {
      setShow(true);
      // Блокируем прокрутку страницы, пока не принято соглашение
      document.body.style.overflow = "hidden";
    } else {
      // Если согласие уже есть, тихо запускаем антифрод и затем метрику
      runAntiFraudAndMetrika(false);
    }

    // Очистка при размонтировании
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const injectYandexMetrika = () => {
    if (document.getElementById("yandex-metrika")) {
      console.log("[Metrika] Скрипт уже был инициализирован ранее.");
      return;
    }

    console.log("[Antifraud] Проверка пройдена. Внедряем Яндекс.Метрику в <head>...");

    // Внедряем основной скрипт
    const script = document.createElement("script");
    script.id = "yandex-metrika";
    script.type = "text/javascript";
    script.async = true;
    script.text = `
      (function(m,e,t,r,i,k,a){
          m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
      })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=110892673', 'ym');

      ym(110892673, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
    `;
    document.head.appendChild(script);

    // Добавляем noscript fallback
    const noscriptDiv = document.createElement("noscript");
    noscriptDiv.id = "yandex-metrika-noscript";
    noscriptDiv.innerHTML = `<div><img src="https://mc.yandex.ru/watch/110892673" style="position:absolute; left:-9999px;" alt="" /></div>`;
    document.body.appendChild(noscriptDiv);
  };

  const runAntiFraudAndMetrika = async (interactive = true) => {
    try {
      // Если пользователь только что протянул ползунок (interactive = true),
      // ждать 2.5 секунды не нужно, так как активность уже подтверждена ползунком.
      // Ставим таймут 500мс вместо дефолтных 2500мс для мобильных устройств.
      const botResult = await detectBot(interactive ? 500 : 2500);

      // Отправляем результат на бэкенд
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

      // Запускаем Метрику
      injectYandexMetrika();
    } catch (err) {
      console.error("Antifraud script failed:", err);
    }
  };

  // Обработка движения ползунка
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(parseInt(e.target.value, 10));
  };

  // Обработка отпускания ползунка
  const handleSliderRelease = async () => {
    if (sliderValue >= 95) {
      // Если дотянули до конца
      setSliderValue(100);
      setIsVerifying(true);
      localStorage.setItem("privacy_consent", "true");
      
      await runAntiFraudAndMetrika(true);
      
      // Возвращаем скролл и скрываем окно
      document.body.style.overflow = "";
      setShow(false);
    } else {
      // Если отпустили раньше времени - пружиним обратно
      setSliderValue(0);
    }
  };

  if (!show) return null;

  // Логика движения визуального ползунка (240px общая ширина - 48px ширина самой кнопки = 192px для движения)
  const thumbOffset = (sliderValue / 100) * 192;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="h-8 w-8" strokeWidth={1.5} />
        </div>

        <h2 className="mb-3 font-serif text-2xl text-foreground">
          Защита от спама
        </h2>
        
        <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
          Мы используем файлы cookie и анализируем технические данные устройства для защиты сайта. 
          Продолжая, вы соглашаетесь с{" "}
          <Link 
            className="text-primary underline hover:text-foreground transition-colors" 
            to="/privacy"
            onClick={() => { document.body.style.overflow = ""; setShow(false); }}
          >
            Политикой конфиденциальности
          </Link>.
        </p>
        
        {/* Компонент Слайдера */}
        <div className="relative mx-auto h-14 w-[240px] flex-shrink-0 overflow-hidden rounded-full bg-secondary/70">
          {/* Заливка фона при протягивании */}
          <div 
            className="absolute left-0 top-0 h-full bg-primary/20 transition-all duration-75" 
            style={{ width: `${sliderValue}%` }} 
          />
          
          {/* Текст внутри слайдера */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-sm font-medium text-foreground/70">
            {isVerifying ? "Проверка..." : "Протяните вправо"}
          </div>

          {/* Невидимый input range для управления */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue}
            onChange={handleSliderChange}
            onMouseUp={handleSliderRelease}
            onTouchEnd={handleSliderRelease}
            disabled={isVerifying}
            className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0"
          />

          {/* Визуальная кнопка-ползунок */}
          <div
            className="absolute bottom-1 left-1 top-1 z-10 flex w-[40px] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md pointer-events-none transition-all duration-75"
            style={{ transform: `translateX(${thumbOffset}px)` }}
          >
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
