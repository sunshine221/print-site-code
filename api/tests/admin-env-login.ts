import assert from "node:assert/strict"
import Database from "better-sqlite3"
import bcrypt from "bcryptjs"
import { resolveAdminSeed, syncAdminFromEnv } from "../seed.js"

function createDb() {
  const db = new Database(":memory:")
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_user (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      username TEXT UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `)
  return db
}

{
  const env = {
    ADMIN_EMAIL: " admin@example.com ",
    ADMIN_USERNAME: " Admin ",
    ADMIN_PASSWORD: " p@ss ",
    ADMIN_NAME: " 管理员 ",
  } as any

  const r = resolveAdminSeed(env)
  assert.equal(r.email, "admin@example.com")
  assert.equal(r.username, "admin")
  assert.equal(r.password, "p@ss")
  assert.equal(r.name, "管理员")
  assert.equal(r.hasEmail, true)
  assert.equal(r.hasUsername, true)
  assert.equal(r.hasPassword, true)
  assert.equal(r.hasName, true)
}

{
  const db = createDb()
  db.prepare(
    "INSERT INTO admin_user (id, email, username, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  ).run("1", "admin@example.com", "admin", "管理员", bcrypt.hashSync("old", 10), new Date().toISOString())

  syncAdminFromEnv(db, { ADMIN_USERNAME: "admin", ADMIN_PASSWORD: "new" } as any)

  const row = db
    .prepare("SELECT id, email, username, name, password_hash FROM admin_user WHERE id = ?")
    .get("1") as any
  assert.equal(row.username, "admin")
  assert.equal(bcrypt.compareSync("new", row.password_hash), true)
}

{
  const db = createDb()
  syncAdminFromEnv(db, { ADMIN_EMAIL: "root@example.com", ADMIN_USERNAME: "root", ADMIN_PASSWORD: "pw" } as any)
  const row = db.prepare("SELECT email, username, password_hash FROM admin_user LIMIT 1").get() as any
  assert.equal(row.email, "root@example.com")
  assert.equal(row.username, "root")
  assert.equal(bcrypt.compareSync("pw", row.password_hash), true)
}
