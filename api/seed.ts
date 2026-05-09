import fs from "node:fs"
import path from "node:path"
import { nanoid } from "nanoid"
import bcrypt from "bcryptjs"
import type Database from "better-sqlite3"

function nowIso() {
  return new Date().toISOString()
}

function getAdminSeed() {
  const emailEnv = process.env.ADMIN_EMAIL?.trim()
  const usernameEnv = process.env.ADMIN_USERNAME?.trim()
  const passwordEnv = process.env.ADMIN_PASSWORD?.trim()
  const nameEnv = process.env.ADMIN_NAME?.trim()

  const email = emailEnv || "admin@example.com"
  const username = (usernameEnv || "admin").toLowerCase()
  const password = passwordEnv || "admin12345"
  const name = nameEnv || "管理员"
  return { email, username, password, name, emailEnv, usernameEnv, passwordEnv, nameEnv }
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

function seedAdmin(db: Database.Database) {
  const { email, username, password, name, emailEnv, usernameEnv, passwordEnv, nameEnv } = getAdminSeed()
  const existing = db
    .prepare(
      "SELECT id, email, username, name, password_hash FROM admin_user ORDER BY created_at ASC LIMIT 1",
    )
    .get() as any

  if (!existing?.id) {
    const passwordHash = bcrypt.hashSync(password, 10)
    db.prepare(
      "INSERT INTO admin_user (id, email, username, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(nanoid(), email, username, name, passwordHash, nowIso())
    return
  }

  const updates: string[] = []
  const values: any[] = []

  if (emailEnv && emailEnv !== existing.email) {
    updates.push("email = ?")
    values.push(email)
  }

  const existingUsername = String(existing.username || "").trim().toLowerCase()
  if ((usernameEnv && username !== existingUsername) || (!existingUsername && username)) {
    updates.push("username = ?")
    values.push(username)
  }

  if (nameEnv && nameEnv !== existing.name) {
    updates.push("name = ?")
    values.push(name)
  }

  if (passwordEnv && !bcrypt.compareSync(passwordEnv, existing.password_hash)) {
    updates.push("password_hash = ?")
    values.push(bcrypt.hashSync(passwordEnv, 10))
  }

  if (!updates.length) return

  db.prepare(`UPDATE admin_user SET ${updates.join(", ")} WHERE id = ?`).run(...values, existing.id)
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
