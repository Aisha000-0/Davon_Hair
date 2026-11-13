import React from 'react'

export default function FeaturedCollectionsSection() {
  return (
    <section className="py-24 md:py-32 bg-[var(--ink)] text-[var(--white)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-[var(--champagne)] uppercase tracking-widest mb-2">Featured Collections</p>
            <h2 className="text-4xl font-serif font-bold">Curated Selections</h2>
          </div>
          <a href="/shop" className="text-[var(--champagne)] text-sm hover:underline">
            View all
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <article
              key={i}
              className="group border border-charcoal rounded-lg overflow-hidden hover-shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={`/images/products/honey-1.svg`}
                  alt="Featured collection"
                  className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                />
              </div>
              <div className="p-4">
                <span className="text-xs text-[var(--champagne)] uppercase tracking-wider mb-2">Bone Straight</span>
                <h3 className="text-sm font-serif font-medium text-[var(--white)] line-clamp-2">Collection {i}</h3>
                <p className="text-lg font-bold mt-2">₦{500000 + i * 70000}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}