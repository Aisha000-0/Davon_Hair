import { Router } from 'express'
import { z } from 'zod'
import fs from 'node:fs'
import { db } from '../db'
import { requireAuth } from '../auth'
import {
  ApiError,
  asyncHandler,
  audit,
  deliveryFeeFor,
  generateOrderNumber,
  getSettings,
  notify,
  parseImages,
} from '../helpers'
import { imageUpload, storePaymentProof } from '../uploads'

const router = Router()

type OrderRow = Record<string, any> & { id: number; order_number: string }

const PAYMENT_METHOD = 'BANK TRANSFER'

function newOrderNumber() {
  for (let i = 0; i < 10; i++) {
    const candidate = generateOrderNumber()
    const exists = db.prepare('SELECT 1 FROM orders WHERE order_number = ?').get(candidate)
    if (!exists) return candidate
  }
  return `DK-${Date.now()}`
}

function getOrderByNumber(orderNumber: string) {
  return db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber) as OrderRow | undefined
}

function orderItems(orderId: number) {
  return db
    .prepare(
      `SELECT id, product_id, variant_id, product_name, variant_label, sku, unit_price, quantity, line_total, image
       FROM order_items WHERE order_id = ? ORDER BY id`,
    )
    .all(orderId) as Record<string, unknown>[]
}

function orderHistory(orderId: number) {
  return db
    .prepare(
      "SELECT status, note, created_at FROM order_status_history WHERE order_id = ? AND status != '__note__' ORDER BY id",
    )
    .all(orderId)
}

function evidenceSummary(orderId: number) {
  return db
    .prepare(
      `SELECT id, transaction_ref, amount_claimed, transfer_date, note, status, rejection_reason, reviewed_at, created_at
       FROM payment_evidence WHERE order_id = ? ORDER BY id DESC`,
    )
    .all(orderId)
    .map((e: any) => ({
      id: e.id,
      transactionRef: e.transaction_ref,
      amountClaimed: e.amount_claimed,
      transferDate: e.transfer_date,
      note: e.note,
      status: e.status,
      rejectionReason: e.rejection_reason,
      reviewedAt: e.reviewed_at,
      createdAt: e.created_at,
    }))
}

function publicOrderView(row: OrderRow) {
  const settings = getSettings()
  const awaiting = row.payment_status === 'PENDING PAYMENT' || row.payment_status === 'REJECTED'
  return {
    id: row.id,
    orderNumber: row.order_number,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    state: row.state,
    city: row.city,
    address: row.address,
    landmark: row.landmark,
    instructions: row.instructions,
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    total: row.total,
    paymentStatus: row.payment_status,
    fulfilmentStatus: row.fulfilment_status,
    paymentMethod: row.payment_method,
    trackingNumber: row.tracking_number,
    trackingCarrier: row.tracking_carrier,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    paidAt: row.paid_at,
    items: orderItems(row.id),
    history: orderHistory(row.id),
    evidence: evidenceSummary(row.id),
    paymentDetails: awaiting
      ? {
          bankName: settings.bank_name,
          accountName: settings.bank_account_name,
          accountNumber: settings.bank_account_number,
          instructions: settings.payment_instructions,
          estimatedDelivery: settings.estimated_delivery,
        }
      : null,
  }
}

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name.').max(100),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.'),
  phone: z
    .string()
    .trim()
    .min(7, 'Please enter a valid phone number.')
    .max(30)
    .regex(/^[0-9+()\-\s]+$/, 'Please enter a valid phone number.'),
  state: z.string().trim().min(2, 'Please select your state.').max(60),
  city: z.string().trim().min(2, 'Please enter your city.').max(80),
  address: z.string().trim().min(5, 'Please enter your delivery address.').max(400),
  landmark: z.string().trim().max(200).optional().default(''),
  instructions: z.string().trim().max(500).optional().default(''),
  items: z
    .array(
      z.object({
        variantId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().min(1).max(20),
      }),
    )
    .min(1, 'Your cart is empty.')
    .max(40),
})

/** Release reserved stock for an order exactly once. */
export function releaseStock(orderId: number, reason: string) {
  const order = db.prepare('SELECT id, order_number, stock_released FROM orders WHERE id = ?').get(orderId) as
    | { id: number; order_number: string; stock_released: number }
    | undefined
  if (!order || order.stock_released) return false
  const items = db
    .prepare('SELECT variant_id, quantity FROM order_items WHERE order_id = ?')
    .all(orderId) as { variant_id: number | null; quantity: number }[]
  const restock = db.prepare('UPDATE product_variants SET stock = stock + ? WHERE id = ?')
  db.transaction(() => {
    for (const item of items) {
      if (item.variant_id) restock.run(item.quantity, item.variant_id)
    }
    db.prepare('UPDATE orders SET stock_released = 1 WHERE id = ?').run(orderId)
    db.prepare(
      "INSERT INTO order_status_history (order_id, status, note, created_by) VALUES (?, '__note__', ?, 'system')",
    ).run(orderId, reason)
  })()
  return true
}

router.post(
  '/orders',
  asyncHandler(async (req, res) => {
    const data = checkoutSchema.parse(req.body)
    const settings = getSettings()
    const backorders = !!settings.allow_backorders

    // Re-price every line from the database. Browser totals are never trusted.
    const priced: {
      variant: any
      quantity: number
      unitPrice: number
      lineTotal: number
      productName: string
      label: string
      image: string
    }[] = []

    for (const item of data.items) {
      const variant = db
        .prepare(
          `SELECT v.*, p.name AS p_name, p.images AS p_images, p.published AS p_published
           FROM product_variants v JOIN products p ON p.id = v.product_id
           WHERE v.id = ?`,
        )
        .get(item.variantId) as any
      if (!variant || !variant.is_active || !variant.p_published) {
        throw new ApiError(409, 'One of the items in your bag is no longer available. Please review your bag.')
      }
      if (variant.stock < item.quantity && !backorders) {
        throw new ApiError(
          409,
          variant.stock === 0
            ? `${variant.p_name} is now sold out. Please remove it to continue.`
            : `Only ${variant.stock} of ${variant.p_name} remain. Please reduce the quantity.`,
        )
      }
      priced.push({
        variant,
        quantity: item.quantity,
        unitPrice: variant.price,
        lineTotal: variant.price * item.quantity,
        productName: variant.p_name,
        label: [variant.length, variant.density, variant.lace_type, variant.color]
          .filter(Boolean)
          .join(' · '),
        image: variant.image || parseImages(variant.p_images)[0] || '',
      })
    }

    const subtotal = priced.reduce((sum, p) => sum + p.lineTotal, 0)
    const deliveryFee = deliveryFeeFor(data.state, subtotal)
    const total = subtotal + deliveryFee

    const orderNumber = newOrderNumber()
    const userId = req.user?.id ?? null

    const create = db.transaction(() => {
      const info = db
        .prepare(
          `INSERT INTO orders
            (order_number, user_id, email, full_name, phone, state, city, address, landmark, instructions,
             subtotal, delivery_fee, total, payment_status, fulfilment_status, payment_method)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING PAYMENT', 'AWAITING PAYMENT', ?)`,
        )
        .run(
          orderNumber,
          userId,
          data.email,
          data.fullName,
          data.phone,
          data.state,
          data.city,
          data.address,
          data.landmark || null,
          data.instructions || null,
          subtotal,
          deliveryFee,
          total,
          PAYMENT_METHOD,
        )
      const orderId = Number(info.lastInsertRowid)

      const addItem = db.prepare(
        `INSERT INTO order_items
          (order_id, product_id, variant_id, product_name, variant_label, sku, unit_price, quantity, line_total, image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      const decrement = db.prepare(
        'UPDATE product_variants SET stock = stock - ? WHERE id = ? AND stock >= ?',
      )

      for (const line of priced) {
        addItem.run(
          orderId,
          line.variant.product_id,
          line.variant.id,
          line.productName,
          line.label,
          line.variant.sku,
          line.unitPrice,
          line.quantity,
          line.lineTotal,
          line.image,
        )
        const result = decrement.run(line.quantity, line.variant.id, line.quantity)
        if (!backorders && result.changes !== 1) {
          throw new ApiError(409, 'An item sold out while you were checking out. Please review your bag.')
        }
      }

      db.prepare(
        `INSERT INTO order_status_history (order_id, status, note, created_by)
         VALUES (?, 'AWAITING PAYMENT', 'Order placed. Awaiting bank transfer.', 'customer')`,
      ).run(orderId)
      notify({
        audience: 'admin',
        type: 'order.created',
        title: 'New order placed',
        body: `${orderNumber} · ${data.fullName} · ₦${total.toLocaleString('en-NG')}`,
        orderId,
      })
      if (userId) {
        notify({
          audience: 'customer',
          userId,
          type: 'order.created',
          title: 'Your order has been placed',
          body: `Order ${orderNumber} is awaiting your bank transfer.`,
          orderId,
        })
      }
      audit({
        actorId: userId,
        actorEmail: data.email,
        action: 'order.created',
        entity: 'order',
        entityId: orderNumber,
        details: { total, items: priced.length },
      })
      return orderId
    })

    const orderId = create()
    const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as OrderRow
    res.status(201).json({ order: publicOrderView(row) })
  }),
)

const lookupSchema = z.object({
  orderNumber: z.string().trim().min(4, 'Enter your order number.'),
  email: z.string().trim().toLowerCase().email('Enter the email used for the order.'),
})

router.post(
  '/orders/lookup',
  asyncHandler(async (req, res) => {
    const data = lookupSchema.parse(req.body)
    const row = db
      .prepare('SELECT * FROM orders WHERE order_number = ? COLLATE NOCASE')
      .get(data.orderNumber.trim()) as OrderRow | undefined
    if (!row || row.email.toLowerCase() !== data.email) {
      throw new ApiError(404, 'We could not find an order matching that order number and email.')
    }
    res.json({ order: publicOrderView(row) })
  }),
)

router.get(
  '/account/orders',
  requireAuth,
  asyncHandler(async (req, res) => {
    const rows = db
      .prepare(
        `SELECT o.*, (SELECT COUNT(*) FROM order_items i WHERE i.order_id = o.id) AS item_count
         FROM orders o WHERE o.user_id = ? ORDER BY o.id DESC`,
      )
      .all(req.user!.id) as OrderRow[]
    res.json({
      orders: rows.map((r) => ({
        orderNumber: r.order_number,
        total: r.total,
        paymentStatus: r.payment_status,
        fulfilmentStatus: r.fulfilment_status,
        createdAt: r.created_at,
        itemCount: r.item_count,
      })),
    })
  }),
)

router.get(
  '/account/orders/:orderNumber',
  requireAuth,
  asyncHandler(async (req, res) => {
    const row = getOrderByNumber(String(req.params.orderNumber))
    if (!row || row.user_id !== req.user!.id) throw new ApiError(404, 'Order not found.')
    res.json({ order: publicOrderView(row) })
  }),
)

const evidenceSchema = z.object({
  orderNumber: z.string().trim().min(4, 'Order number is required.'),
  email: z.string().trim().toLowerCase().email('Enter the email used for the order.'),
  transactionRef: z.string().trim().min(3, 'Please enter the transaction reference.').max(120),
  amount: z.coerce.number().int().positive('Enter the amount you transferred.').max(1_000_000_000),
  transferDate: z.string().trim().min(8, 'Please enter the transfer date.').max(30),
  note: z.string().trim().max(500).optional().default(''),
})

router.post(
  '/payments/evidence',
  imageUpload.single('screenshot'),
  asyncHandler(async (req, res) => {
    const data = evidenceSchema.parse(req.body)
    const row = db
      .prepare('SELECT * FROM orders WHERE order_number = ? COLLATE NOCASE')
      .get(data.orderNumber.trim()) as OrderRow | undefined

    if (!row) throw new ApiError(404, 'Order not found.')
    const isOwner = req.user && row.user_id && req.user.id === row.user_id
    const emailMatches = row.email.toLowerCase() === data.email
    if (!isOwner && !emailMatches) {
      throw new ApiError(404, 'We could not find an order matching that order number and email.')
    }
    if (row.payment_status === 'PAID') throw new ApiError(409, 'This order has already been paid and verified.')
    if (row.payment_status === 'AWAITING VERIFICATION') {
      throw new ApiError(409, 'Your payment evidence is already awaiting verification. We will be in touch shortly.')
    }
    if (!['PENDING PAYMENT', 'REJECTED'].includes(row.payment_status)) {
      throw new ApiError(409, 'Payment evidence cannot be submitted for this order at this stage.')
    }
    if (!req.file) throw new ApiError(400, 'Please attach a screenshot of your transfer.')

    const stored = storePaymentProof(req.file.buffer)

    const save = db.transaction(() => {
      const info = db
        .prepare(
          `INSERT INTO payment_evidence
            (order_id, submitted_by, file_name, file_path, mime, size, transaction_ref, amount_claimed, transfer_date, note)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          row.id,
          req.user?.id ?? null,
          stored.fileName,
          stored.filePath,
          stored.mime,
          stored.size,
          data.transactionRef,
          data.amount,
          data.transferDate,
          data.note || null,
        )
      db.prepare(
        "UPDATE orders SET payment_status = 'AWAITING VERIFICATION', updated_at = datetime('now') WHERE id = ?",
      ).run(row.id)
      db.prepare(
        `INSERT INTO order_status_history (order_id, status, note, created_by)
         VALUES (?, '__note__', 'Payment evidence submitted — awaiting administrator verification.', 'customer')`,
      ).run(row.id)
      notify({
        audience: 'admin',
        type: 'payment.awaiting_verification',
        title: 'Payment evidence submitted',
        body: `${row.order_number} · ₦${data.amount.toLocaleString('en-NG')} · ref ${data.transactionRef}`,
        orderId: row.id,
      })
      if (row.user_id) {
        notify({
          audience: 'customer',
          userId: row.user_id,
          type: 'payment.submitted',
          title: 'Payment evidence received',
          body: `We are verifying your transfer for order ${row.order_number}.`,
          orderId: row.id,
        })
      }
      audit({
        actorId: req.user?.id ?? null,
        actorEmail: row.email,
        action: 'payment.evidence_submitted',
        entity: 'order',
        entityId: row.order_number,
        details: { evidenceId: Number(info.lastInsertRowid), amount: data.amount, transactionRef: data.transactionRef },
      })
      return Number(info.lastInsertRowid)
    })

    try {
      save()
    } catch (error) {
      try {
        fs.unlinkSync(`${process.env.PWD}/storage/payment-proofs/${stored.filePath}`)
      } catch {
        /* best-effort cleanup */
      }
      throw error
    }

    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(row.id) as OrderRow
    res.status(201).json({
      order: publicOrderView(updated),
      message:
        'Thank you — your payment evidence has been received and is awaiting verification. This is not yet a confirmation that the funds have arrived.',
    })
  }),
)

export default router
