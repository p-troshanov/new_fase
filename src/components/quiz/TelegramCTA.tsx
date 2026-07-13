import { Send } from "lucide-react";

// TODO: replace with real Telegram channel/bot link when available
export const TELEGRAM_URL = "https://t.me/newface";

interface TelegramCTAProps {
  label?: string;
  note?: string;
}

export function TelegramCTA({
  label = "Забрать протокол в Telegram",
  note = "Пришлём разбор и напоминания в удобный мессенджер",
}: TelegramCTAProps) {
  return (
    <div className="space-y-2">
      <a
        href={TELEGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-4 text-[15px] font-medium text-foreground transition hover:border-primary hover:bg-primary/5"
      >
        <Send className="h-4 w-4" strokeWidth={1.75} />
        {label}
      </a>
      {note && (
        <p className="text-center text-xs text-muted-foreground">{note}</p>
      )}
    </div>
  );
}
