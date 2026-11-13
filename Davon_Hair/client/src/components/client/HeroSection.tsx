import React from 'react'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-[var(--ink)] text-[var(--white)] overflow-hidden">
      <div className="absolute inset-0">
        {/* Abstract hair-like gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-br from-charcoal to-[var(--gold)] opacity-30"></div>
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-full h-96 bg-[var(--champagne)] opacity-10 rotate-2 transform"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center animate-fade-in-up">
          <p className="text-[var(--champagne)] text-sm uppercase tracking-widest mb-6 letter-spacing-2">
            Discover premium wigs
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight mb-6">
            YOUR BEAUTY. YOUR CROWN. YOUR LUXURY.
          </h1>
          <p className="text-lg md:text-xl text-[var(--smoke)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover premium wigs crafted to elevate your confidence and express your style.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <button
              className="inline-block px-8 py-3 bg-[var(--gold)] text-[var(--ink)] font-serif font-medium text-lg hover:opacity-95 transition-opacity duration-200 focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
            >
              SHOP NOW
            </button>
            <button
              className="inline-block px-8 py-3 border-2 border-[var(--gold)] text-[var(--gold)] text-lg font-serif font-medium hover:bg-[var(--gold)] hover:text-[var(--ink)] transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
            >
              EXPLORE COLLECTION
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}