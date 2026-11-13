import React from 'react'

export default function PromoBanner() {
  return (
    <section className="py-24 md:py-32 bg-[var(--gold)]/10 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[var(--gold)] rotate-2 transform opacity-20"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 text-[var(--ink)]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-[var(--champagne)] uppercase tracking-widest mb-4">Special Offer</p>
          <h2 className="text-4xl font-serif font-bold mb-6">
            Complimentary delivery on orders above ₦1,500,000
          </h2>
          <p className="text-lg mb-8 leading-relaxed">
            Nationwide delivery · Estimated 2–5 working days after payment verification
          </p>
          <button
            className="inline-block px-8 py-3 bg-[var(--gold)] text-[var(--ink)] font-serif font-medium text-lg hover:opacity-95 transition-opacity duration-200 focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
          >
            Shop Now
          </button>
        </div>
      </div>
    </section>
  )
}