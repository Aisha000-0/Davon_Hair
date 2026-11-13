import React from 'react'

export default function ConfirmationPage() {
  const params = new URLSearchParams(window.location.search)
  const orderNumber = params.get('orderNumber') || 'N/A'

  return (
    <section className="py-24 bg-[var(--charcoal)] text-[var(--white)]">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold text-[var(--gold)] mb-6">
          Order Confirmed
        </h2>
        <div className="bg-[var(--ink)] rounded-lg p-8 text-center">
          <p className="text-5xl font-serif font-bold mb-4"># {orderNumber}</p>
          <p className="text-lg mb-6">Your order has been received and is being processed.</p>
          <p className="text-[var(--champagne)]">Estimated delivery: 2–5 working days after payment verification</p>
          <button
            onClick={() => window.history.back()}
            className="inline-block px-6 py-2 bg-[var(--gold)] text-[var(--ink)] font-serif font-medium text-lg hover:opacity-95 transition-opacity duration-200 focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </section>
  )
}