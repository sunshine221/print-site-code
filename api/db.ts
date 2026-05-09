import fs from "node:fs"
import path from "node:path"
import Database from "better-sqlite3"

const defaultDbPath = path.join(process.cwd(), "api", "data", "app.sqlite")

export function getDbPath() {
  return process.env.DB_PATH?.trim() || defaultDbPath
}

export function openDb() {
  const dbPath = getDbPath()
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })
  const db = new Database(dbPath)
  db.pragma("journal_mode = WAL")
  db.pragma("foreign_keys = ON")
  return db
}

export type Db = ReturnType<typeof openDb>
