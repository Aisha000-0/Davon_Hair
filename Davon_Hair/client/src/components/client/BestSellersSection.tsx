import React from 'react'

export default function BestSellersSection() {
  return (
    <section className="py-24 md:py-32 bg-[var(--charcoal)] text-[var(--white)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-[var(--champagne)] uppercase tracking-widest mb-2">Best Sellers</p>
            <h2 className="text-4xl font-serif font-bold">Customer Favorites</h2>
          </div>
          <a href="/shop" className="text-[var(--champagne)] text-sm hover:underline">
            View all
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Placeholder cards — in a full impl these would fetch real best-seller data */}
          {[1, 2, 3, 4].map((i) => (
            <article
              key={i}
              className="group border border-charcoal rounded-lg overflow-hidden hover-shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={`/images/products/bob-auburn-1.svg`}
                  alt="Best seller"
                  className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                />
              </div>
              <div className="p-4">
                <p className="text-xs text-[var(--champagne)] uppercase tracking-widest mb-1">Bone Straight</p>
                <h3 className="text-sm font-serif font-medium text-[var(--white)] line-clamp-2">Product Name {i}</h3>
                <p className="text-lg font-bold mt-2">₦{200000 + i * 50000}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}