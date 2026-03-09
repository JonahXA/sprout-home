const Database = require("better-sqlite3");
const db = new Database("sprout.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS portfolios (
    user_email TEXT PRIMARY KEY,
    cash_balance REAL DEFAULT 10000,
    starting_balance REAL DEFAULT 10000,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    symbol TEXT NOT NULL,
    quantity REAL NOT NULL,
    avg_price REAL NOT NULL,
    UNIQUE(user_email, symbol)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    symbol TEXT NOT NULL,
    side TEXT NOT NULL,
    quantity REAL NOT NULL,
    price REAL NOT NULL,
    total REAL NOT NULL,
    timestamp TEXT DEFAULT (datetime('now'))
  );
`);

module.exports = db;