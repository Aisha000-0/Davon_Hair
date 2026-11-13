import React from 'react'

export default function WhyShopSection() {
  return (
    <section className="py-24 md:py-32 bg-[var(--charcoal)] text-[var(--white)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <article
              key={i}
              className="p-6 border-l-4 border-[var(--gold)] hover:bg-[var(--charcoal)] transition-colors duration-200"
            >
              <div className="flex items-start">
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-[var(--gold)] text-[var(--ink)] font-serif font-bold text-sm ml-2">
                  {i}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-sm font-serif font-medium text-[var(--white)]">Premium Quality</h3>
                  <p className="text-[var(--champagne)] text-sm mt-1">100% raw donor hair, cuticle-aligned for lasting softness.</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}