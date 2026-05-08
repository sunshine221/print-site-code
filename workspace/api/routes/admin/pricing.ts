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

router.post("/:id/enable", (req: Request, res: Response) => {
  const db = getDb()
  const id = String(req.params.id || "")
  db.transaction(() => {
    db.prepare("UPDATE pricing_rule SET enabled = 0").run()
    db.prepare("UPDATE pricing_rule SET enabled = 1 WHERE id = ?").run(id)
  })()
  res.json({ success: true })
})

export default router

