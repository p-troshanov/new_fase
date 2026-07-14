// src/db/index.ts
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Создаем базу данных в корне проекта
const dbPath = path.resolve(process.cwd(), "sqlite.db");
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);

// Инициализируем схему базы данных (SQLite)
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    telegram TEXT,
    source TEXT,
    interest TEXT,
    product_id TEXT,
    amount_kopecks INTEGER,
    answers TEXT, -- JSON строка
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    invoice_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    amount_kopecks INTEGER NOT NULL,
    currency TEXT DEFAULT 'RUB',
    offer_key TEXT,
    promo_code TEXT,
    status TEXT DEFAULT 'pending',
    provider TEXT DEFAULT 'cloudpayments',
    payment_method TEXT,
    source TEXT,
    session_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);
