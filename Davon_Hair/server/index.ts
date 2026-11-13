import 'reflect-metadata'
import express from 'express'
import session from 'express-session'
import path from 'node:path'
import fs from 'node:fs'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { db } from './db'
import { seedDatabase } from './seed'
import { getSettings } from './helpers'
import authRoutes from './routes/auth'
import catalogRoutes from './routes/catalog'
import orderRoutes from './routes/orders'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT || 4000)

// Middleware
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(cookieParser())
app.use(
  session({
    secret: process.env.JWT_SECRET || 'dev-only-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
)

// Serve static assets in production (client build)
const buildDir = path.join(process.cwd(), 'dist')
if (fs.existsSync(buildDir)) {
  app.use(express.static(buildDir))
  app.get('*', (_req, res) => res.sendFile(path.join(buildDir, 'index.html')))
}

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/catalog', catalogRoutes)
app.use('/api/orders', orderRoutes)

// Public settings endpoint
app.get('/api/settings/public', (_req, res) => {
  res.json({ settings: getSettings() })
})

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true, db: db ? 'connected' : 'no db' }))

// Root
app.get('/', (_req, res) => res.json({ message: 'DEVON KUXURY WIGS API running' }))

// Initialize DB and seed
seedDatabase(false)

// Start server
app.listen(PORT, () => {
  console.log(`🛍️  DEVON KUXURY WIGS server listening on http://localhost:${PORT}`)
  console.log(`📊  Health: /api/health  •  Settings: /api/settings/public  •  Admin: /api/auth/login`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down gracefully')
  db.close()
  process.exit(0)
})
process.on('SIGINT', () => {
  console.log('SIGINT received — shutting down gracefully')
  db.close()
  process.exit(0)
})