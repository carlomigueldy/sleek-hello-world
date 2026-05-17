import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "messages.db");

const globalForDb = global as typeof global & { _db?: Database.Database };

const db: Database.Database =
  globalForDb._db ??
  (() => {
    const instance = new Database(dbPath);
    instance.pragma("journal_mode = WAL");

    instance.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        content    TEXT    NOT NULL CHECK(length(content) <= 280),
        author     TEXT    NULL CHECK(author IS NULL OR (length(author) BETWEEN 1 AND 40)),
        created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );

      CREATE INDEX IF NOT EXISTS idx_messages_id_desc ON messages (id DESC);
    `);

    // Migrate existing DB: add author column if it doesn't exist yet
    const cols = (instance.pragma("table_info(messages)") as { name: string }[]).map(
      (c) => c.name
    );
    if (!cols.includes("author")) {
      instance.exec(
        "ALTER TABLE messages ADD COLUMN author TEXT NULL CHECK(author IS NULL OR (length(author) BETWEEN 1 AND 40));"
      );
    }

    return instance;
  })();

if (process.env.NODE_ENV !== "production") {
  globalForDb._db = db;
}

export default db;
