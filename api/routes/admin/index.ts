import { Router } from "express"
import { requireAdmin } from "../../auth.js"
import inquiries from "./inquiries.js"
import products from "./products.js"
import media from "./media.js"
import pricing from "./pricing.js"

const router = Router()

router.use(requireAdmin)
router.use("/inquiries", inquiries)
router.use("/products", products)
router.use("/media", media)
router.use("/pricing", pricing)

export default router

