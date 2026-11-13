import React, { useState } from 'react'

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [order, setOrder] = useState(null)
  const [show, setShow] = useState(false)

  const handleLookup = async () => {
    if (!orderNumber.trim()) return
    try {
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, email: '' }),
      })
      const data = await res.json()
      if (res.ok) {
        setOrder(data.order)
        setShow(true)
      } else {
        alert(data.message || 'Order not found')
      }
    } catch {
      alert('Failed to look up order')
    }
  }

  if (order) {
    const publicView = {
      id: order.id,
      orderNumber: order.order_number,
      email: order.email,
      fullName: order.full_name,
      phone: order.phone,
      state: order.state,
      city: order.city,
      address: order.address,
      subtotal: order.subtotal,
      deliveryFee: order.delivery_fee,
      total: order.total,
      paymentStatus: order.payment_status,
      fulfilmentStatus: order.fulfilment_status,
      createdAt: order.created_at,
      items: order.items,
      history: order.history,
      evidence: order.evidence,
      paymentDetails: order.paymentDetails,
    }

    return (
      <section className="py-24 bg-[var(--charcoal)] text-[var(--white)]">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold mb-6">Order Tracking</h2>

          <div className="bg-[var(--ink)] rounded-lg p-6 mb-8">
            <p className="text-[var(--champagne)] text-sm uppercase tracking-wider mb-2">Order #{orderNumber}</p>
            <h1 className="text-5xl font-serif font-bold">{order.orderNumber}</h1>
            <p className="text-[var(--smoke)]">Status: <span className="font-bold">{order.fulfilmentStatus}</span></p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Order Placed</span>
              <small className="text-[var(--muted-grey)]"> {order.createdAt}</small>
            </div>
            {order.history?.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {order.history.map((h: any, idx: number) => (
                  <div
                    key={idx}
                    className={`px-3 py-1 rounded text-xs ${
                      idx === 0
                        ? 'bg-[var(--charcoal)] text-[var(--white)]'
                        : idx === order.history.length - 1
                          ? 'bg-[var(--gold)] text-[var(--ink)]'
                          : 'text-[var(--muted-grey)]'
                    }`}
                  >
                    {h.status}
                  </div>
                ))}
              </div>
            )}
          </div>

          {order.paymentDetails && (
            <div className="mt-8 p-6 border border-charcoal rounded-lg">
              <h3 className="text-[var(--champagne)] text-sm uppercase tracking-wider mb-2">Payment Details</h3>
              <p className="text-[var(--smoke)] text-sm">
                Bank: {order.paymentDetails.bankName}
              </p>
              <p className="text-[var(--smoke)] text-sm">
                Account: {order.paymentDetails.accountName}
              </p>
              <p className="text-[var(--smoke)] text-sm">
                Account #: {order.paymentDetails.accountNumber}
              </p>
              <p className="text-[var(--smoke)] text-sm">
                {order.paymentDetails.instructions}
              </p>
            </div>
          )}

          <div className="mt-8 text-right">
            <a href="/account/orders" className="text-[var(--champagne)] hover:underline">
              Return to account
            </a>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-[var(--charcoal)] text-[var(--white)]">
      <div className="max-w-xl mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold mb-6">Track Your Order</h2>

        <form onSubmit={(e) => { e.preventDefault(); handleLookup() }}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="text-[var(--champagne)] uppercase tracking-wider block mb-2">Order number</label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="DK-20240115-AB12"
                required
                className="w-full px-4 py-3 border border-charcoal rounded-lg bg-[var(--charcoal)] text-[var(--white)] focus:outline-none focus:border-[var(--gold)]"
              />
            </div>
            <button
              type="submit"
              className="w-full px-8 py-3 bg-[var(--gold)] text-[var(--ink)] font-serif font-medium text-lg hover:opacity-95 transition-opacity duration-200 focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
            >
              Track Order
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}