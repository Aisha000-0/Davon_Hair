import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import multer from 'multer'
import { PAYMENT_DIR, PRODUCT_IMAGE_DIR } from './env'
import { ApiError } from './helpers'

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.mimetype)) {
      cb(new ApiError(400, 'Please upload a JPG, PNG or WebP image.'))
      return
    }
    cb(null, true)
  },
})

/**
 * Verify the file's magic bytes — never trust the browser-supplied MIME type.
 * Returns the true image type, or null if the content is not a supported image.
 */
export function sniffImage(buffer: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (buffer.length < 12) return null
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg'
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png'
  }
  if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp'
  }
  return null
}

const EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

export function storeImage(buffer: Buffer, dir: string, prefix: string) {
  const mime = sniffImage(buffer)
  if (!mime) throw new ApiError(400, 'That file is not a valid JPG, PNG or WebP image.')
  fs.mkdirSync(dir, { recursive: true })
  const name = `${prefix}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${EXT[mime]}`
  fs.writeFileSync(path.join(dir, name), buffer)
  return { name, mime, size: buffer.length }
}

export function storePaymentProof(buffer: Buffer) {
  const stored = storeImage(buffer, PAYMENT_DIR, 'proof')
  return {
    fileName: stored.name,
    filePath: stored.name,
    mime: stored.mime,
    size: stored.size,
  }
}

export function resolveStoredPath(dir: string, name: string) {
  // Defend against path traversal — only a bare filename is ever accepted.
  const safe = path.basename(name)
  const full = path.join(dir, safe)
  if (!full.startsWith(dir + path.sep)) throw new ApiError(400, 'Invalid file reference.')
  if (!fs.existsSync(full)) throw new ApiError(404, 'File not found.')
  return full
}
