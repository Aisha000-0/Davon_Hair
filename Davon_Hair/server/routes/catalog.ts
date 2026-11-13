import { Router } from 'express'
import { z } from 'zod'
import { db } from '../db'
import {
  asyncHandler,
  ApiError,
  audit,
  getSettings,
  notify,
  parseImages,
  publicSettings,
} from '../helpers'

const router = Router()

type ProductRow = {
  id: number
  name: string
  slug: string
  description: string
  category_id: number | null
  category_name: string | null
  category_slug: string | null
  hair_type: string
  texture: string
  length: string
  density: string
  lace_type: string
  color: string
  cap_size: string
  base_price: number
  compare_at_price: number | null
  images: string
  is_featured: number
  is_new: number
  is_best_seller: number
  published: number
  created_at: string
  min_price: number | null
  total_stock: number | null
}

const LIST_SELECT = `
  SELECT p.*, c.name AS category_name, c.slug AS category_slug,
    (SELECT MIN(v.price) FROM product_variants v WHERE v.product_id = p.id AND v.is_active = 1) AS min_price,
    (SELECT SUM(v.stock) FROM product_variants v WHERE v.product_id = p.id AND v.is_active = 1) AS total_stock
  FROM products p LEFT JOIN categories c ON c.id = p.category_id
`

export function mapProduct(row: ProductRow) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    category: row.category_id
      ? { id: row.category_id, name: row.category_name, slug: row.category_slug }
      : null,
    hairType: row.hair_type,
    texture: row.texture,
    length: row.length,
    density: row.density,
    laceType: row.lace_type,
    color: row.color,
    capSize: row.cap_size,
    price: row.min_price ?? row.base_price,
    compareAtPrice: row.compare_at_price,
    images: parseImages(row.images),
    image: parseImages(row.images)[0] ?? '',
    isFeatured: !!row.is_featured,
    isNew: !!row.is_new,
    isBestSeller: !!row.is_best_seller,
    published: !!row.published,
    stock: row.total_stock ?? 0,
    inStock: (row.total_stock ?? 0) > 0,
    createdAt: row.created_at,
  }
}

function mapVariant(v: Record<string, unknown>) {
  return {
    id: v.id,
    sku: v.sku,
    length: v.length,
    density: v.density,
    laceType: v.lace_type,
    color: v.color,
    price: v.price,
    compareAtPrice: v.compare_at_price,
    stock: v.stock,
    image: v.image,
    isActive: !!(v.is_active as number),
  }
}

export function productDetailBySlug(slug: string, includeUnpublished = false) {
  const row = db
    .prepare(`${LIST_SELECT} WHERE p.slug = ? ${includeUnpublished ? '' : 'AND p.published = 1'}`)
    .get(slug) as ProductRow | undefined
  if (!row) return null
  const variants = db
    .prepare('SELECT * FROM product_variants WHERE product_id = ? AND is_active = 1 ORDER BY sort_order, id')
    .all(row.id) as Record<string, unknown>[]
  return { ...mapProduct(row), variants: variants.map(mapVariant) }
}

router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const rows = db
      .prepare(
        `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.published = 1) AS product_count
         FROM categories c WHERE c.visible = 1 ORDER BY c.sort_order, c.id`,
      )
      .all() as Record<string, unknown>[]
    res.json({
      categories: rows.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        image: r.image,
        productCount: r.product_count,
      })),
    })
  }),
)

const listSchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  hairType: z.string().trim().max(60).optional(),
  texture: z.string().trim().max(60).optional(),
  sort: z.enum(['newest', 'price-asc', 'price-desc', 'featured']).optional(),
  collection: z.enum(['all', 'new', 'best', 'featured']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(48).optional(),
})

router.get(
  '/products',
  asyncHandler(async (req, res) => {
    const f = listSchema.parse(req.query)
    const where: string[] = ['p.published = 1']
    const params: unknown[] = []

    if (f.q) {
      where.push('(p.name LIKE ? OR p.texture LIKE ? OR p.description LIKE ?)')
      params.push(`%${f.q}%`, `%${f.q}%`, `%${f.q}%`)
    }
    if (f.category) {
      where.push('c.slug = ?')
      params.push(f.category)
    }
    if (f.hairType) {
      where.push('p.hair_type = ?')
      params.push(f.hairType)
    }
    if (f.texture) {
      where.push('p.texture = ?')
      params.push(f.texture)
    }
    if (f.minPrice != null) {
      where.push('(SELECT MIN(v.price) FROM product_variants v WHERE v.product_id = p.id AND v.is_active = 1) >= ?')
      params.push(f.minPrice)
    }
    if (f.maxPrice != null) {
      where.push('(SELECT MIN(v.price) FROM product_variants v WHERE v.product_id = p.id AND v.is_active = 1) <= ?')
      params.push(f.maxPrice)
    }
    if (f.collection === 'new') where.push('p.is_new = 1')
    if (f.collection === 'best') where.push('p.is_best_seller = 1')
    if (f.collection === 'featured') where.push('p.is_featured = 1')

    const order =
      f.sort === 'newest'
        ? 'p.created_at DESC, p.id DESC'
        : f.sort === 'price-asc'
          ? 'min_price ASC'
          : f.sort === 'price-desc'
            ? 'min_price DESC'
            : 'p.is_featured DESC, p.is_best_seller DESC, p.id ASC'

    const limit = f.limit ?? 12
    const page = f.page ?? 1
    const base = `${LIST_SELECT} WHERE ${where.join(' AND ')}`
    const total = (db.prepare(`SELECT COUNT(*) AS c FROM (${base})`).get(...params) as { c: number }).c
    const rows = db
      .prepare(`${base} ORDER BY ${order} LIMIT ? OFFSET ?`)
      .all(...params, limit, (page - 1) * limit) as ProductRow[]

    const hairTypes = db
      .prepare("SELECT DISTINCT hair_type FROM products WHERE published = 1 AND hair_type != '' ORDER BY hair_type")
      .all() as { hair_type: string }[]
    const textures = db
      .prepare("SELECT DISTINCT texture FROM products WHERE published = 1 AND texture != '' ORDER BY texture")
      .all() as { texture: string }[]
    const prices = db
      .prepare(
        `SELECT MIN(price) AS min, MAX(price) AS max FROM product_variants v
         JOIN products p ON p.id = v.product_id WHERE p.published = 1 AND v.is_active = 1`,
      )
      .get() as { min: number | null; max: number | null }

    res.json({
      products: rows.map(mapProduct),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      facets: {
        hairTypes: hairTypes.map((h) => h.hair_type),
        textures: textures.map((t) => t.texture),
        priceMin: prices.min ?? 0,
        priceMax: prices.max ?? 0,
      },
    })
  }),
)

router.get(
  '/products/:slug',
  asyncHandler(async (req, res) => {
    const product = productDetailBySlug(String(req.params.slug))
    if (!product) throw new ApiError(404, 'This piece could not be found.')
    const related = db
      .prepare(
        `${LIST_SELECT} WHERE p.published = 1 AND p.id != ? AND p.category_id = ? ORDER BY p.is_best_seller DESC LIMIT 4`,
      )
      .all(product.id, product.category?.id ?? -1) as ProductRow[]
    let relatedMapped = related.map(mapProduct)
    if (relatedMapped.length < 4) {
      const fill = db
        .prepare(`${LIST_SELECT} WHERE p.published = 1 AND p.id != ? ORDER BY RANDOM() LIMIT ?`)
        .all(product.id, 4 - relatedMapped.length) as ProductRow[]
      relatedMapped = relatedMapped.concat(fill.map(mapProduct))
    }
    res.json({ product, related: relatedMapped })
  }),
)

router.get('/settings/public', (_req, res) => {
  res.json({ settings: publicSettings() })
})

router.post(
  '/newsletter',
  asyncHandler(async (req, res) => {
    const email = z.string().trim().toLowerCase().email('Enter a valid email address.').parse(req.body?.email)
    db.prepare('INSERT OR IGNORE INTO newsletter (email) VALUES (?)').run(email)
    res.json({ ok: true, message: 'You are on the list. Welcome to DEVON KUXURY.' })
  }),
)

router.post(
  '/contact',
  asyncHandler(async (req, res) => {
    const data = z
      .object({
        name: z.string().trim().min(2, 'Please share your name.').max(80),
        email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
        subject: z.string().trim().max(120).optional().default('General enquiry'),
        message: z.string().trim().min(10, 'Please tell us a little more.').max(3000),
      })
      .parse(req.body)
    db.prepare('INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)').run(
      data.name,
      data.email,
      data.subject,
      data.message,
    )
    notify({
      audience: 'admin',
      type: 'contact',
      title: 'New contact message',
      body: `${data.name} (${data.email}) sent: ${data.subject}`,
    })
    audit({ action: 'contact.received', entity: 'message', details: { email: data.email } })
    res.json({ ok: true, message: 'Thank you — our team will respond within one business day.' })
  }),
)

const cartSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().min(1).max(20),
      }),
    )
    .max(40),
})

router.post(
  '/cart/validate',
  asyncHandler(async (req, res) => {
    const { items } = cartSchema.parse(req.body)
    const settings = getSettings()
    const backorders = !!settings.allow_backorders
    const lines = items.map((item) => {
      const row = db
        .prepare(
          `SELECT v.*, p.name, p.slug, p.images, p.published FROM product_variants v
           JOIN products p ON p.id = v.product_id WHERE v.id = ?`,
        )
        .get(item.variantId) as
        | (Record<string, unknown> & {
            id: number
            product_id: number
            name: string
            slug: string
            images: string
            price: number
            compare_at_price: number | null
            stock: number
            length: string
            density: string
            lace_type: string
            color: string
            sku: string
            published: number
            image: string | null
            is_active: number
          })
        | undefined
      if (!row || !row.published || !row.is_active) {
        return {
          variantId: item.variantId,
          quantity: item.quantity,
          available: false,
          message: 'This item is no longer available.',
          lineTotal: 0,
        }
      }
      const available = backorders || row.stock >= item.quantity
      return {
        variantId: row.id,
        productId: row.product_id,
        name: row.name,
        slug: row.slug,
        image: row.image || parseImages(row.images)[0] || '',
        sku: row.sku,
        label: [row.length, row.density, row.lace_type, row.color].filter(Boolean).join(' · '),
        unitPrice: row.price,
        compareAtPrice: row.compare_at_price,
        quantity: item.quantity,
        stock: row.stock,
        available,
        message: available
          ? row.stock <= Number(settings.low_stock_threshold)
            ? 'Low stock'
            : ''
          : `Only ${row.stock} left in this variation`,
        lineTotal: row.price * item.quantity,
      }
    })
    const subtotal = lines.reduce((sum, l) => sum + (l.available ? l.lineTotal : 0), 0)
    res.json({
      lines,
      subtotal,
      valid: lines.every((l) => l.available),
      lowStockThreshold: Number(settings.low_stock_threshold) || 3,
    })
  }),
)

export default router
