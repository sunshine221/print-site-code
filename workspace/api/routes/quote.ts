import { Router, type Request, type Response } from "express"
import { getDb } from "../context.js"
import { estimateQuote } from "../pricing.js"

const router = Router()

router.post("/estimate", (req: Request, res: Response) => {
  const db = getDb()
  const estimate = estimateQuote(db, req.body || {})
  res.json({ success: true, data: estimate })
})

export default router

