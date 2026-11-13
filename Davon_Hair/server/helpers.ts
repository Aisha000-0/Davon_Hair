import type { Request, Response, NextFunction } from 'express'
import { db } from './db'

export const PAYMENT_STATUSES = [
  'PENDING PAYMENT',
  'AWAITING VERIFICATION',
  'PAID',
  'REJECTED',
  'REFUND PENDING',
  'REFUNDED',
] as const

export const FULFILMENT_STATUSES = [
  'AWAITING PAYMENT',
  'PAYMENT CONFIRMED',
  'PROCESSING',
  'READY FOR DISPATCH',
  'DISPATCHED',
  'OUT FOR DELIVERY',
  'DELIVERED',
  'CANCELLED',
] as const

export const DEFAULT_SETTINGS: Record<string, unknown> = {
  bank_name: '',
  bank_account_name: '',
  bank_account_number: '',
  payment_instructions:
    'Transfer the exact amount to the account above, using your order number as the payment reference. Then upload a screenshot of the transfer so our team can verify it. Orders are only processed after payment has been verified.',
  low_stock_threshold: 3,
  allow_backorders: false,
  free_delivery_threshold: 0,
  estimated_delivery: '2 – 5 working days after payment verification',
  delivery_zones: [
    { state: 'Lagos', fee: 4000 },
    { state: 'Abuja (FCT)', fee: 5500 },
    { state: 'Rivers', fee: 6500 },
    { state: 'Oyo', fee: 6000 },
    { state: 'Kano', fee: 7000 },
    { state: 'Enugu', fee: 6000 },
    { state: 'Kaduna', fee: 7000 },
    { state: 'Delta', fee: 6500 },
  ],
  store_email: 'hello@devonkuxurywigs.com',
  store_phone: '+234 800 000 0000',
  store_whatsapp: '+234 800 000 0000',
  store_address: 'Lagos, Nigeria',
  instagram: 'https://instagram.com/',
  tiktok: 'https://tiktok.com/',
  facebook: '',
  twitter: '',
  announcement: 'Complimentary delivery on orders above ₦1,500,000 · Nationwide delivery',
}

export function getSettings(): Record<string, unknown> {
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[]
  const out: Record<string, unknown> = { ...DEFAULT_SETTINGS }
  for (const row of rows) {
    try {
      out[row.key] = JSON.parse(row.value)
    } catch {
      out[row.key] = row.value
    }
  }
  return out
}

export function setSetting(key: string, value: unknown) {
  const stored = typeof value === 'string' ? JSON.stringify(value) : JSON.stringify(value)
  db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
  ).run(key, stored)
}

export function publicSettings() {
  const s = getSettings()
  return {
    bank_name: s.bank_name,
    bank_account_name: s.bank_account_name,
    bank_account_number: s.bank_account_number,
    payment_instructions: s.payment_instructions,
    delivery_zones: s.delivery_zones,
    free_delivery_threshold: s.free_delivery_threshold,
    estimated_delivery: s.estimated_delivery,
    store_email: s.store_email,
    store_phone: s.store_phone,
    store_whatsapp: s.store_whatsapp,
    store_address: s.store_address,
    instagram: s.instagram,
    tiktok: s.tiktok,
    facebook: s.facebook,
    twitter: s.twitter,
    announcement: s.announcement,
  }
}

export function deliveryFeeFor(state: string, subtotal: number): number {
  const s = getSettings()
  const zones = Array.isArray(s.delivery_zones) ? (s.delivery_zones as { state: string; fee: number }[]) : []
  const threshold = Number(s.free_delivery_threshold) || 0
  if (threshold > 0 && subtotal >= threshold) return 0
  const zone = zones.find((z) => z.state.toLowerCase() === state.trim().toLowerCase())
  if (!zone) return Number((s.default_delivery_fee as number) || 0)
  return Number(zone.fee) || 0
}

let orderCounter = 0
export function generateOrderNumber(): string {
  const d = new Date()
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  orderCounter = (orderCounter + 1) % 100
  return `DK-${date}-${random}${String(orderCounter).padStart(2, '0')}`
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function variantLabel(v: {
  length?: string | null
  density?: string | null
  lace_type?: string | null
  color?: string | null
}): string {
  return [v.length, v.density, v.lace_type, v.color].filter(Boolean).join(' · ') || 'Standard'
}

export function notify(input: {
  audience: 'admin' | 'customer'
  userId?: number | null
  type: string
  title: string
  body: string
  orderId?: number | null
}) {
  db.prepare(
    `INSERT INTO notifications (audience, user_id, type, title, body, order_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(input.audience, input.userId ?? null, input.type, input.title, input.body, input.orderId ?? null)
}

export function audit(input: {
  actorId?: number | null
  actorEmail?: string | null
  action: string
  entity?: string
  entityId?: string | number
  details?: unknown
}) {
  db.prepare(
    `INSERT INTO audit_log (actor_id, actor_email, action, entity, entity_id, details)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    input.actorId ?? null,
    input.actorEmail ?? null,
    input.action,
    input.entity ?? null,
    input.entityId != null ? String(input.entityId) : null,
    input.details != null ? JSON.stringify(input.details) : null,
  )
}

export class ApiError extends Error {
  status: number
  details?: unknown
  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.status = status
    this.details = details
  }
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown> | unknown,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export function parseImages(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === 'string')
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === 'string')
    } catch {
      return raw ? [raw] : []
    }
  }
  return []
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
}

/** Basic in-memory rate limiter (single process). Good enough for auth endpoints. */
const attempts = new Map<string, { count: number; resetAt: number }>()
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = attempts.get(key)
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  entry.count += 1
  return entry.count <= limit
}
