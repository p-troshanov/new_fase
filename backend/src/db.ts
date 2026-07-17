// backend/src/db.ts
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'antifraud.db');
const db = new Database(dbPath, { verbose: console.log });
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS access_rules (
    id INTEGER PRIMARY KEY,
    mode TEXT DEFAULT 'off',
    countries TEXT,
    block_vpn INTEGER DEFAULT 0,
    block_datacenter INTEGER DEFAULT 0,
    block_tor INTEGER DEFAULT 0,
    block_bad_bots INTEGER DEFAULT 0,
    block_message TEXT,
    allow_user_agents TEXT,
    allow_host_suffixes TEXT,
    updated_at TEXT
  );

  INSERT OR IGNORE INTO access_rules (id, mode, countries, block_vpn, block_datacenter, block_tor, block_bad_bots, block_message, allow_user_agents, allow_host_suffixes)
  VALUES (1, 'off', '[]', 0, 0, 0, 0, 'Доступ запрещен', '[]', '[]');

  CREATE TABLE IF NOT EXISTS ip_ranges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cidr TEXT UNIQUE,
    category TEXT,
    source TEXT,
    synced_at TEXT
  );

  CREATE TABLE IF NOT EXISTS ip_ranges_sync_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at TEXT,
    finished_at TEXT,
    ok INTEGER,
    total_upserted INTEGER,
    sources TEXT,
    error TEXT
  );

  CREATE TABLE IF NOT EXISTS ip_bans (
    id TEXT PRIMARY KEY,
    ip_hash TEXT UNIQUE,
    ip_prefix TEXT,
    reason TEXT,
    banned_by TEXT,
    expires_at TEXT,
    note TEXT,
    hit_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ip_whitelist (
    id TEXT PRIMARY KEY,
    ip_hash TEXT UNIQUE,
    ip_display TEXT,
    note TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS blocked_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_hash TEXT,
    ip_prefix TEXT,
    country TEXT,
    path TEXT,
    reason TEXT,
    rule_detail TEXT,
    bot_category TEXT,
    is_headless INTEGER,
    user_agent TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS geo_cache (
    ip_hash TEXT PRIMARY KEY,
    country TEXT,
    region TEXT,
    city TEXT,
    isp TEXT,
    fetched_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    ip_hash TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    name TEXT,
    phone TEXT,
    email TEXT,
    task TEXT,
    is_spam INTEGER,
    spam_reason TEXT
  );

  -- ОБНОВЛЕННАЯ ТАБЛИЦА: Добавлены bot_score, bot_level, signals
  CREATE TABLE IF NOT EXISTS page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_hash TEXT,
    bot_score INTEGER DEFAULT 0,
    bot_level TEXT,
    signals TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;
