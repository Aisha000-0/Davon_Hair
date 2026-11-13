import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config()

export const ROOT = process.cwd()
export const PORT = Number(process.env.PORT || 4000)
export const IS_PROD = process.env.NODE_ENV === 'production'
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me'
export const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`

export const DATA_DIR = path.join(ROOT, 'data')
export const STORAGE_DIR = path.join(ROOT, 'storage')
export const PAYMENT_DIR = path.join(STORAGE_DIR, 'payment-proofs')
export const PRODUCT_IMAGE_DIR = path.join(STORAGE_DIR, 'product-images')

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@devonkuxurywigs.com'
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'DevonAdmin2026!'
export const ADMIN_NAME = process.env.ADMIN_NAME || 'Devon Store Manager'

export const SESSION_COOKIE = 'dk_session'
export const SESSION_DAYS = 7
