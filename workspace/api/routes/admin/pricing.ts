import { Router, type Request, type Response } from "express"
import { nanoid } from "nanoid"
import { getDb } from "../../context.js"

const router = Router()

function nowIso() {
  return new Date().toISOString()
}

router.get("/", (req: Request, res: Response) => {
  const db = getDb()
  const rows = db
    .prepare(
      "SELECT id, name, version, enabled, rule_json, created_at FROM pricing_rule ORDER BY created_at DESC",
    )
    .all() as any[]

  res.json({
    success: true,
    data: rows.map((r) => ({
      id: r.id,
      name: r.name,
      version: r.version,
      enabled: Boolean(r.enabled),
      rule: JSON.parse(r.rule_json || "{}"),
      createdAt: r.created_at,
    })),
  })
})

router.get("/:id", (req: Request, res: Response) => {
  const db = getDb()
  const id = String(req.params.id || "")
  const row = db
    .prepare("SELECT id, name, version, enabled, rule_json, created_at FROM pricing_rule WHERE id = ?")
    .get(id) as any

  if (!row?.id) {
    res.status(404).json({ success: false, error: "Not found" })
    return
  }

  res.json({
    success: true,
    data: {
      id: row.id,
      name: row.name,
      version: row.version,
      enabled: Boolean(row.enabled),
      rule: JSON.parse(row.rule_json || "{}"),
      createdAt: row.created_at,
    },
  })
})

router.post("/", (req: Request, res: Response) => {
  const db = getDb()
  const body = req.body || {}
  const name = String(body.name || "").trim() || "报价规则"
  const version = String(body.version || "").trim()
  if (!version) {
    res.status(400).json({ success: false, error: "Missing version" })
    return
  }
  const ruleJson = JSON.stringify(body.rule || {})
  const id = nanoid()
  db.prepare(
    "INSERT INTO pricing_rule (id, name, version, enabled, rule_json, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  ).run(id, name, version, body.enabled ? 1 : 0, ruleJson, nowIso())
  res.json({ success: true, data: { id } })
})

router.patch("/:id", (req: Request, res: Response) => {
  const db = getDb()
  const id = String(req.params.id || "")
  const existing = db.prepare("SELECT id FROM pricing_rule WHERE id = ?").get(id) as any
  if (!existing?.id) {
    res.status(404).json({ success: false, error: "Not found" })
    return
  }

  const body = req.body || {}
  const updates: string[] = []
  const params: any[] = []

  if (body.name !== undefined) {
    updates.push("name = ?")
    params.push(String(body.name || "").trim() || "报价规则")
  }
  if (body.version !== undefined) {
    const version = String(body.version || "").trim()
    if (!version) {
      res.status(400).json({ success: false, error: "Missing version" })
      return
    }
    updates.push("version = ?")
    params.push(version)
  }
  if (body.enabled !== undefined) {
    updates.push("enabled = ?")
    params.push(body.enabled ? 1 : 0)
  }
  if (body.rule !== undefined) {
    updates.push("rule_json = ?")
    params.push(JSON.stringify(body.rule || {}))
  }

  if (!updates.length) {
    res.json({ success: true })
    return
  }

  params.push(id)
  db.prepare(`UPDATE pricing_rule SET ${updates.join(", ")} WHERE id = ?`).run(...params)
  res.json({ success: true })
})

router.post("/:id/enable", (req: Request, res: Response) => {
  const db = getDb()
  const id = String(req.params.id || "")
  db.transaction(() => {
    db.prepare("UPDATE pricing_rule SET enabled = 0").run()
    db.prepare("UPDATE pricing_rule SET enabled = 1 WHERE id = ?").run(id)
  })()
  res.json({ success: true })
})

router.delete("/:id", (req: Request, res: Response) => {
  const db = getDb()
  const id = String(req.params.id || "")
  db.prepare("DELETE FROM pricing_rule WHERE id = ?").run(id)
  res.json({ success: true })
})

export default router
