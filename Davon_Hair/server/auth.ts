import type { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from './db'
import { IS_PROD, JWT_SECRET, SESSION_COOKIE, SESSION_DAYS } from './env'

export interface SessionUser {
  id: number
  name: string
  email: string
  phone: string | null
  role: 'customer' | 'admin'
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: SessionUser
    }
  }
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export function checkPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function getCookieUser(req: Request): SessionUser | undefined {
  const token = req.cookies?.[SESSION_COOKIE]
  if (!token) return undefined
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: number }
    const user = db
      .prepare('SELECT id, name, email, phone, role FROM users WHERE id = ?')
      .get(payload.sub) as SessionUser | undefined
    return user
  } catch {
    return undefined
  }
}

export function setSession(res: Response, userId: number) {
  const token = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: `${SESSION_DAYS}d` })
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: IS_PROD,
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
    path: '/',
  })
}

export function clearSession(res: Response) {
  res.clearCookie(SESSION_COOKIE, { path: '/' })
}

export function attachUser(req: Request, _res: Response, next: NextFunction) {
  const user = getCookieUser(req)
  if (user) req.user = user
  next()
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Please sign in to continue.' })
  next()
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Please sign in to continue.' })
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Administrator access only.' })
  next()
}
