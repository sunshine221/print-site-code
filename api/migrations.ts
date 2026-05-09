import fs from "node:fs"
import path from "node:path"
import type Database from "better-sqlite3"

function ensureMigrationsTable(db: Database.Database) {
  db.exec(
    "CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL);",
  )
}

function listMigrationFiles(migrationsDir: string) {
  if (!fs.existsSync(migrationsDir)) return []
  return fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b))
    .map((f) => path.join(migrationsDir, f))
}

export function runMigrations(db: Database.Database) {
  const migrationsDir =
    process.env.MIGRATIONS_DIR?.trim() || path.join(process.cwd(), "migrations")

  ensureMigrationsTable(db)
  const applied = new Set<string>(
    db
      .prepare("SELECT id FROM schema_migrations ORDER BY id ASC")
      .all()
      .map((r: any) => r.id as string),
  )

  const files = listMigrationFiles(migrationsDir)
  const now = new Date().toISOString()

  for (const file of files) {
    const id = path.basename(file)
    if (applied.has(id)) continue
    const sql = fs.readFileSync(file, "utf8")
    db.transaction(() => {
      db.exec(sql)
      db
        .prepare("INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)")
        .run(id, now)
    })()
  }
}

