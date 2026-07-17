# backend/config.py

import os
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

# Настройки базы данных PostgreSQL
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_NAME = os.getenv("DB_NAME", "screener_db")
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Пул прокси (парсинг строки через запятую)
PROXIES_ENV = os.getenv("PROXIES", "")
PROXIES = [p.strip() for p in PROXIES_ENV.split(",") if p.strip()]

# Семафор: сколько запросов к Binance API могут выполняться одновременно
MAX_CONCURRENT_REQUESTS = int(os.getenv("MAX_CONCURRENT_REQUESTS", "30"))

# Настройки парсинга
HISTORY_KLINE_LIMIT = 10000  # Сколько свечей скачивать для новых монет (макс истории)
UPDATE_INTERVAL_SECONDS = 300  # Обновление реального времени (5 минут)
SYMBOL_UPDATE_INTERVAL_HOURS = 24  # Обновление символов раз в сутки

# Настройки очистки старых котировок
MAX_KLINE_RECORDS = int(os.getenv("MAX_KLINE_RECORDS", "10000"))  # Максимум записей на один символ в каждом таймфрейме
CLEANUP_INTERVAL_HOURS = int(os.getenv("CLEANUP_INTERVAL_HOURS", "1"))  # Как часто запускать очистку

# Таймфреймы для сбора и их длительность в миллисекундах
TIMEFRAMES_MS = {
    "1m": 60 * 1000,
    "5m": 5 * 60 * 1000,
    "15m": 15 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "4h": 4 * 60 * 60 * 1000,
    "1d": 24 * 60 * 60 * 1000
}
TARGET_TIMEFRAMES = list(TIMEFRAMES_MS.keys())

# Фильтры
MIN_24H_VOLUME_USDT = 10_000_000  # 10 млн USDT

# API Ключи для сторонних сервисов
CMC_API_KEY = os.getenv("CMC_API_KEY", "")

# Binance API & External URLs
BINANCE_FUTURES_TICKER_URL = "https://fapi.binance.com/fapi/v1/ticker/24hr"
BINANCE_FUTURES_KLINES_URL = "https://fapi.binance.com/fapi/v1/klines"
BINANCE_FUTURES_EXCHANGE_INFO_URL = "https://fapi.binance.com/fapi/v1/exchangeInfo"
BINANCE_FUTURES_OPEN_INTEREST_URL = "https://fapi.binance.com/fapi/v1/openInterest"
CMC_QUOTES_URL = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest"

API_REQUEST_DELAY = 0.2  # Задержка (используется только если нет прокси)
