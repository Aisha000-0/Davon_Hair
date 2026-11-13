import { Router } from 'express'
import crypto from 'node:crypto'
import { z } from 'zod'
import { db } from '../db'
import { asyncHandler, ApiError, isEmail, rateLimit, audit } from '../helpers'
import {
  checkPassword,
  clearSession,
  hashPassword,
  requireAuth,
  setSession,
  type SessionUser,
} from '../auth'

const router = Router()

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name.').max(80),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.'),
  phone: z.string().trim().max(30).optional().default(''),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(200)
    .regex(/[A-Za-z]/, 'Password must contain a letter.')
    .regex(/[0-9]/, 'Password must contain a number.'),
})

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    if (!rateLimit(`register:${req.ip}`, 8, 10 * 60_000)) {
      throw new ApiError(429, 'Too many attempts. Please try again later.')
    }
    const data = registerSchema.parse(req.body)
    if (!isEmail(data.email)) throw new ApiError(400, 'Please enter a valid email address.')
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email)
    if (existing) throw new ApiError(409, 'An account with this email already exists.')

    const hash = await hashPassword(data.password)
    const info = db
      .prepare("INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'customer')")
      .run(data.name, data.email, data.phone || null, hash)
    const id = Number(info.lastInsertRowid)
    setSession(res, id)
    const user = db
      .prepare('SELECT id, name, email, phone, role FROM users WHERE id = ?')
      .get(id) as SessionUser
    audit({ actorId: id, actorEmail: data.email, action: 'account.registered', entity: 'user', entityId: id })
    res.status(201).json({ user })
  }),
)

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Email is required.'),
  password: z.string().min(1, 'Password is required.'),
})

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    if (!rateLimit(`login:${req.ip}`, 12, 10 * 60_000)) {
      throw new ApiError(429, 'Too many login attempts. Please try again in a few minutes.')
    }
    const data = loginSchema.parse(req.body)
    const row = db
      .prepare('SELECT id, name, email, phone, role, password_hash FROM users WHERE email = ?')
      .get(data.email) as (SessionUser & { password_hash: string }) | undefined
    if (!row || !(await checkPassword(data.password, row.password_hash))) {
      throw new ApiError(401, 'Those details do not match an account. Please check your email and password.')
    }
    setSession(res, row.id)
    res.json({
      user: { id: row.id, name: row.name, email: row.email, phone: row.phone, role: row.role },
    })
  }),
)

router.post('/logout', (req, res) => {
  clearSession(res)
  res.json({ ok: true })
})

router.get(
  '/me',
  asyncHandler(async (req, res) => {
    if (!req.user) return res.json({ user: null })
    const unread = db
      .prepare("SELECT COUNT(*) AS c FROM notifications WHERE audience='customer' AND user_id = ? AND read_at IS NULL")
      .get(req.user.id) as { c: number }
    res.json({ user: req.user, unreadNotifications: unread.c })
  }),
)

router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    if (!rateLimit(`forgot:${req.ip}`, 6, 15 * 60_000)) {
      throw new ApiError(429, 'Too many requests. Please try again later.')
    }
    const email = z.string().trim().toLowerCase().email().parse(req.body?.email)
    const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email) as
      | { id: number; email: string }
      | undefined

    let devUrl: string | undefined
    if (user) {
      const token = crypto.randomBytes(32).toString('hex')
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
      const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString()
      db.prepare('UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0').run(user.id)
      db.prepare('INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)').run(
        user.id,
        tokenHash,
        expires,
      )
      const url = `/reset-password?token=${token}`
      // No email provider is configured by default. Log the link securely on the server.
      console.log(`\n[password reset] ${user.email} → ${url} (expires in 1 hour)\n`)
      if (process.env.NODE_ENV !== 'production') devUrl = url
    }

    res.json({
      message:
        'If an account exists for that email, a password reset link has been created. In this deployment the link is printed in the server log because no email provider is configured.',
      devResetUrl: devUrl,
    })
  }),
)

router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const data = z
      .object({
        token: z.string().min(20),
        password: z
          .string()
          .min(8, 'Password must be at least 8 characters.')
          .regex(/[A-Za-z]/, 'Password must contain a letter.')
          .regex(/[0-9]/, 'Password must contain a number.'),
      })
      .parse(req.body)
    const tokenHash = crypto.createHash('sha256').update(data.token).digest('hex')
    const row = db
      .prepare(
        'SELECT id, user_id, expires_at, used FROM password_resets WHERE token_hash = ? ORDER BY id DESC LIMIT 1',
      )
      .get(tokenHash) as { id: number; user_id: number; expires_at: string; used: number } | undefined
    if (!row || row.used || new Date(row.expires_at) < new Date()) {
      throw new ApiError(400, 'This reset link is invalid or has expired. Please request a new one.')
    }
    const hash = await hashPassword(data.password)
    db.transaction(() => {
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, row.user_id)
      db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').run(row.id)
      db.prepare('UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0').run(row.user_id)
    })()
    audit({ action: 'account.password_reset', entity: 'user', entityId: row.user_id })
    res.json({ ok: true })
  }),
)

router.get(
  '/admin-check',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ admin: req.user?.role === 'admin' })
  }),
)

export default router
