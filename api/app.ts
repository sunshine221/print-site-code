/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import productsRoutes from './routes/products.js'
import quoteRoutes from './routes/quote.js'
import inquiriesRoutes from './routes/inquiries.js'
import uploadsRoutes from './routes/uploads.js'
import mediaRoutes from './routes/media.js'
import adminRoutes from './routes/admin/index.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/quote', quoteRoutes)
app.use('/api/inquiries', inquiriesRoutes)
app.use('/api/uploads', uploadsRoutes)
app.use('/api/media', mediaRoutes)
app.use('/api/admin', adminRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
