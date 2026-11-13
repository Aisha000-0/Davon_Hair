import React from 'react'

/* Clearly-labelled sample testimonials — never fake or unsourced. */
export default function TestimonialsSection() {
  return (
    <section className="py-24 md:py-32 bg-[var(--ink)] text-[var(--white)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
          <div>
            <p className="text-sm text-[var(--champagne)] uppercase tracking-widest mb-2">Sample Testimonials</p>
            <h2 className="text-4xl font-serif font-bold">What Customers Say</h2>
          </div>
          <a href="/contact" className="text-[var(--champagne)] text-sm hover:underline">
            Share your story
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <article
              key={i}
              className="p-6 border-l-4 border-[var(--gold)] rounded-lg border-charcoal"
            >
              <blockquote className="text-lg mb-4 leading-relaxed">
                <p>
                  'The quality is incredible — the hair is so soft and the cap fits perfectly. I felt like royalty the moment I put it on.'
                </p>
              </blockquote>
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <p className="text-[var(--champagne)] font-medium">Sample Customer {i}</p>
                  <p className="text-xs text-[var(--muted-grey)]">• Sample •</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}