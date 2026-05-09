import { Router, type Request, type Response } from "express"
import { requireAdmin } from "../auth.js"
import { createPresignedPutUrl } from "../cos.js"

const router = Router()

router.post("/presign", (req: Request, res: Response) => {
  try {
    const body = req.body || {}
    const result = createPresignedPutUrl({
      fileName: String(body.fileName || ""),
      fileSize: Number(body.fileSize || 0),
      mimeType: body.mimeType ? String(body.mimeType) : undefined,
      scope: "visitor",
    })
    res.json({ success: true, data: result })
  } catch (e: any) {
    const msg = String(e?.message || "Failed")
    const code = msg.includes("not configured") ? 501 : 400
    res.status(code).json({ success: false, error: msg })
  }
})

router.post("/admin/presign", requireAdmin, (req: Request, res: Response) => {
  try {
    const body = req.body || {}
    const result = createPresignedPutUrl({
      fileName: String(body.fileName || ""),
      fileSize: Number(body.fileSize || 0),
      mimeType: body.mimeType ? String(body.mimeType) : undefined,
      scope: "admin",
    })
    res.json({ success: true, data: result })
  } catch (e: any) {
    const msg = String(e?.message || "Failed")
    const code = msg.includes("not configured") ? 501 : 400
    res.status(code).json({ success: false, error: msg })
  }
})

export default router

