import React from 'react'

export default function SocialGallerySection() {
  return (
    <section className="py-24 md:py-32 bg-[var(--charcoal)] text-[var(--white)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-8">
          <p className="text-sm text-[var(--champagne)] uppercase tracking-widest">Social Gallery</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="border-charcoal rounded-lg overflow-hidden group-hover:shadow-xl transition-shadow duration-300"
              style={{
                aspectRatio: '1 / 1',
              }}
            >
              <img
                src={`/images/social/square-${i}.svg`}
                alt="Social post"
                className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}