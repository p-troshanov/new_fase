// src/components/ConsentBanner.tsx
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { detectBot } from "@/client-bot-detector"; // Путь до твоего скрипта

export function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Проверяем, соглашался ли юзер ранее
    const hasConsent = localStorage.getItem("privacy_consent");
    
    if (!hasConsent) {
      setShow(true);
    } else {
      // Если согласие уже есть, тихо запускаем антифрод в фоне
      runAntiFraud();
    }
  }, []);

  const runAntiFraud = async () => {
    try {
      // Запускаем сбор сигнатур (WebGL, Canvas, движения мыши)
      const botResult = await detectBot();

      // Отправляем на твой Node.js бекенд
      await fetch("/api/track-pageview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Отправляем результаты детектора, если нужно
          bot_score: botResult.score, 
          bot_level: botResult.level,
          signals: botResult.signals
        }),
      });
    } catch (err) {
      console.error("Antifraud script failed:", err);
    }
  };

  const handleAccept = () => {
    localStorage.setItem("privacy_consent", "true");
    setShow(false);
    // Как только нажали "Принять" — сразу стартуем проверку
    runAntiFraud();
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card p-4 shadow-2xl md:p-6 animate-in slide-in-from-bottom-full">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Мы используем файлы cookie и собираем технические данные устройства 
          для защиты от фрода и спама. Продолжая использовать сайт, вы соглашаетесь с{" "}
          <Link to="/privacy" className="text-primary underline hover:text-foreground transition-colors">
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