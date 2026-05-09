import fs from "node:fs"
import path from "node:path"
import { nanoid } from "nanoid"
import bcrypt from "bcryptjs"
import type Database from "better-sqlite3"

function nowIso() {
  return new Date().toISOString()
}

export function resolveAdminSeed(env: NodeJS.ProcessEnv = process.env) {
  const emailRaw = env.ADMIN_EMAIL?.trim()
  const usernameRaw = env.ADMIN_USERNAME?.trim()
  const passwordRaw = env.ADMIN_PASSWORD?.trim()
  const nameRaw = env.ADMIN_NAME?.trim()

  const email = emailRaw || "admin@example.com"
  const username = (usernameRaw || "admin").toLowerCase()
  const password = passwordRaw || "admin12345"
  const name = nameRaw || "管理员"

  return {
    email,
    username,
    password,
    name,
    hasEmail: Boolean(emailRaw),
    hasUsername: Boolean(usernameRaw),
    hasPassword: Boolean(passwordRaw),
    hasName: Boolean(nameRaw),
  }
}

export function seedIfEmpty(db: Database.Database) {
  const productCount = db.prepare("SELECT COUNT(*) as c FROM product").get() as any
  if (Number(productCount.c) === 0) {
    seedDemoProducts(db)
  }

  const ruleCount = db.prepare("SELECT COUNT(*) as c FROM pricing_rule").get() as any
  if (Number(ruleCount.c) === 0) {
    seedPricingRule(db)
  }

  seedAdmin(db)
}

export function syncAdminFromEnv(db: Database.Database, env: NodeJS.ProcessEnv = process.env) {
  const { email, username, password, name, hasEmail, hasUsername, hasPassword, hasName } =
    resolveAdminSeed(env)

  const byEnv = db
    .prepare(
      "SELECT id, email, username, name, password_hash FROM admin_user WHERE email = ? OR lower(username) = ? LIMIT 1",
    )
    .get(email, username) as any

  const first = db
    .prepare("SELECT id, email, username, name, password_hash FROM admin_user ORDER BY created_at ASC LIMIT 1")
    .get() as any

  const existing = byEnv || first

  if (!existing?.id) {
    const passwordHash = bcrypt.hashSync(password, 10)
    db.prepare(
      "INSERT INTO admin_user (id, email, username, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(nanoid(), email, username, name, passwordHash, nowIso())
    return
  }

  const updates: string[] = []
  const values: any[] = []

  if (hasEmail && email !== existing.email) {
    updates.push("email = ?")
    values.push(email)
  }

  const existingUsername = String(existing.username || "").trim().toLowerCase()
  if (hasUsername && username !== existingUsername) {
    updates.push("username = ?")
    values.push(username)
  }

  if (hasName && name !== existing.name) {
    updates.push("name = ?")
    values.push(name)
  }

  if (hasPassword && !bcrypt.compareSync(password, existing.password_hash)) {
    updates.push("password_hash = ?")
    values.push(bcrypt.hashSync(password, 10))
  }

  if (!updates.length) return

  db.prepare(`UPDATE admin_user SET ${updates.join(", ")} WHERE id = ?`).run(...values, existing.id)
}

function seedAdmin(db: Database.Database) {
  syncAdminFromEnv(db, process.env)
}

function seedPricingRule(db: Database.Database) {
  const rule = {
    baseCurrency: "CNY",
    service: {
      baseMin: 120,
      baseMax: 260,
      rushMultiplier: 1.25,
      precisionMultiplier: 1.2,
      processMultiplier: {
        FDM: 1,
        SLA: 1.15,
        SLS: 1.25
      },
      materialMultiplier: {
        PLA: 1,
        ABS: 1.1,
        PA12: 1.25,
        "树脂": 1.15
      }
    }
  }

  const id = nanoid()
  const createdAt = nowIso()
  db.prepare(
    "INSERT INTO pricing_rule (id, name, version, enabled, rule_json, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  ).run(id, "默认报价规则", "v1", 1, JSON.stringify(rule), createdAt)
}

function seedDemoProducts(db: Database.Database) {
  const seedPath =
    process.env.SEED_PRODUCTS_PATH?.trim() ||
    path.join(process.cwd(), "api", "seed", "demo-products.json")

  const content = fs.readFileSync(seedPath, "utf8")
  const data = JSON.parse(content) as any

  const insertProduct = db.prepare(
    "INSERT INTO product (id, title, summary, process, material, lead_time_days, price_hint, featured, published, tags_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  )
  const insertSku = db.prepare(
    "INSERT INTO product_sku (id, product_id, sku_code, attributes_json, price_min, price_max, currency, stock_qty, published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  )
  const insertMedia = db.prepare(
    "INSERT INTO media (id, type, url, name, size, mime_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
  )
  const linkProductMedia = db.prepare(
    "INSERT INTO product_media (product_id, media_id, sort_order) VALUES (?, ?, ?)",
  )

  const createdAt = nowIso()
  db.transaction(() => {
    for (const p of data.products || []) {
      insertProduct.run(
        p.id,
        p.title,
        p.summary,
        p.process ?? null,
        p.material ?? null,
        p.leadTimeDays ?? null,
        p.priceHint ?? null,
        p.featured ? 1 : 0,
        p.published ? 1 : 0,
        JSON.stringify(p.tags ?? []),
        createdAt,
        createdAt,
      )

      for (const sku of p.skus || []) {
        insertSku.run(
          sku.id,
          p.id,
          sku.skuCode,
          JSON.stringify(sku.attributes ?? {}),
          sku.priceMin ?? null,
          sku.priceMax ?? null,
          data.currency ?? "CNY",
          sku.stockQty ?? null,
          sku.published ? 1 : 0,
          createdAt,
          createdAt,
        )
      }

      let order = 0
      for (const g of p.gallery || []) {
        const mediaId = nanoid()
        insertMedia.run(
          mediaId,
          g.type ?? "image",
          g.url,
          g.name ?? "asset",
          null,
          null,
          createdAt,
        )
        linkProductMedia.run(p.id, mediaId, order)
        order += 1
      }
    }
  })()
}
