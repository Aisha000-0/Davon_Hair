import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const [order, setOrder] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [showEvidence, setShowEvidence] = useState(false)

  // If returning from evidence submission
  React.useEffect(() => {
    if (orderNumber) {
      fetch(`/api/orders/lookup?orderNumber=${orderNumber}`)
        .then((r) => r.json())
        .then((d) => {
          setOrder(d.order)
          setPaymentStatus(d.order?.payment_status || 'pending')
        })
    }
  }, [orderNumber])

  if (!order) return <div>Loading order…</div>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order) return
    setShowEvidence(true)
  }

  if (paymentStatus === 'PAID') {
    return (
      <section className="py-24 bg-[var(--charcoal)] text-[var(--white)]">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-[var(--gold)] mb-6">Order Confirmed</h2>
          <p className="text-lg mb-4">Order <span className="font-bold">{order.orderNumber}</span> has been verified and is now processing.</p>
          <p className="text-[var(--champagne)]">Estimated delivery: 2–5 working days</p>
          <a href="/account/orders" className="text-[var(--champagne)] hover:underline">Return to account</a>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-[var(--charcoal)] text-[var(--white)]">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold mb-6">
          Payment for Order {order.orderNumber}
        </h2>

        {showEvidence ? (
          <div className="space-y-6">
            <p className="text-[var(--champagne)] text-sm uppercase tracking-wider mb-4">
              Upload payment evidence
            </p>
            <form
              onSubmit={async (e: React.FormEvent) => {
                e.preventDefault()
                const fileInput = e.target.querySelector('input[type="file"]') as HTMLInputElement
                if (!fileInput?.files?.[0]) {
                  alert('Please select a screenshot.')
                  return
                }
                const formData = new FormData()
                formData.append('screenshot', fileInput.files[0])
                formData.append('orderNumber', order.orderNumber)
                formData.append('email', order.email)
                formData.append('transactionRef', (e.target as any).transactionRef.value)
                formData.append('amount', (e.target as any).amount.value)
                formData.append('transferDate', (e.target as any).transferDate.value)
                formData.append('note', (e.target as any).note.value)

                const res = await fetch('/api/payments/evidence', {
                  method: 'POST',
                  body: formData,
                })
                const data = await res.json()
                if (res.ok) {
                  setShowEvidence(false)
                  // Re-fetch order status
                  setOrder(data.order)
                  setPaymentStatus(data.order?.payment_status || 'pending')
                  alert(data.message)
                } else {
                  alert(data.message || 'Failed to submit evidence')
                }
              }}
            >
              <div className="grid grid-cols-1 gap-4">
                <label className="hidden sm:block">
                  <span className="text-[var(--champagne)]">Transaction reference:</span>
                  <input
                    type="text"
                    name="transactionRef"
                    placeholder="e.g. GT-123456789"
                    required
                    className="w-full px-4 py-3 border border-charcoal rounded-lg bg-[var(--charcoal)] text-[var(--white)] focus:outline-none focus:border-[var(--gold)]"
                  />
                </label>
                <label>
                  <span className="text-[var(--champagne)]">Amount transferred:</span>
                  <input
                    type="number"
                    name="amount"
                    min="1000"
                    required
                    className="w-full px-4 py-3 border border-charcoal rounded-lg bg-[var(--charcoal)] text-[var(--white)] focus:outline-none focus:border-[var(--gold)]"
                  />₦
                </label>
                <label>
                  <span className="text-[var(--champagne)]">Transfer date:</span>
                  <input
                    type="date"
                    name="transferDate"
                    required
                    className="w-full px-4 py-3 border border-charcoal rounded-lg bg-[var(--charcoal)] text-[var(--white)] focus:outline-none focus:border-[var(--gold)]"
                  />
                </label>
                <label>
                  <span className="text-[var(--champagne)]">Note (optional):</span>
                  <textarea
                    name="note"
                    rows="2"
                    className="w-full px-4 py-3 border border-charcoal rounded-lg bg-[var(--charcoal)] text-[var(--white)] focus:outline-none focus:border-[var(--gold)]"
                  ></textarea>
                </label>
                <label>
                  <span className="text-[var(--champagne)]">Screenshot:</span>
                  <input
                    type="file"
                    name="screenshot"
                    accept="image/jpeg,image/png,image/webp"
                    required
                    className="w-full px-4 py-3 border border-charcoal rounded-lg bg-[var(--charcoal)] text-[var(--white)] focus:outline-none focus:border-[var(--gold)]"
                  />
                </label>
              </div>
              <button
                type="submit"
                className="w-full px-8 py-3 bg-[var(--gold)] text-[var(--ink)] font-serif font-medium text-lg hover:opacity-95 transition-opacity duration-200 focus-visible:ring-2 focus-visible:ring-[var(--gold)] mt-4"
              >
                Submit Evidence
              </button>
            </form>
          </div>
        ) : (
          <>
            <p className="text-[var(--champagne)] text-sm uppercase tracking-wider mb-4">
              Your order is <span className="font-semibold">{order.payment_status}</span>. Please submit a screenshot of your bank transfer to proceed with verification.
            </p>
            <p className="text-[var(--smoke)] text-sm mb-6">
              The amount entered must match the order total of <span className="font-bold">₦{order.total?.toLocaleString('en-NG') || '0'}</span>.
            </p>
            <button
              onClick={() => setShowEvidence(true)}
              className="w-full px-8 py-3 bg-[var(--gold)] text-[var(--ink)] font-serif font-medium text-lg hover:opacity-95 transition-opacity duration-200 focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
            >
              Upload Payment Evidence
            </button>
          </>
        )}

        {order.payment_status === 'AWAITING VERIFICATION' && (
          <div className="mt-8 p-6 border border-charcoal rounded-lg">
            <p className="text-[var(--champagne)] text-sm mb-2">
              Evidence submitted — awaiting administrator verification. You will be notified once verified.
            </p>
            <p className="text-[var(--smoke)] text-xs">
              This is not yet a confirmation that funds have arrived. Do not submit multiple times.
            </p>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-charcoal">
          <p className="text-sm text-[var(--champagne)] uppercase tracking-wider mb-4">
            Delivery details
          </p>
          <p className="text-[var(--smoke)] text-sm">
            State: {order.state || '—'} | City: {order.city || '—'}
          </p>
          <p className="text-[var(--smoke)] text-sm">
            Address: {order.address || '—'}
          </p>
          {order.instructions && (
            <p className="text-[var(--smoke)] text-sm mt-1">
              Instructions: {order.instructions}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}