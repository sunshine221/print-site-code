import type Database from "better-sqlite3"
import { openDb } from "./db.js"
import { runMigrations } from "./migrations.js"
import { seedIfEmpty } from "./seed.js"

let db: Database.Database | null = null

export function getDb() {
  if (db) return db
  db = openDb()
  runMigrations(db)
  seedIfEmpty(db)
  return db
}

