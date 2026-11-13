import React from 'react'

export default function NotFoundPage() {
  return (
    <section className="min-h-screen bg-[var(--charcoal)] text-[var(--white)]">
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl font-serif font-bold mb-4">404</p>
        <h1 className="text-4xl font-serif font-bold">Page Not Found</h1>
        <p className="text-[var(--champagne)] mb-8">The page you are looking for does not exist.</p>
        <a href="/shop" className="inline-block px-8 py-3 bg-[var(--gold)] text-[var(--ink)] font-serif font-medium text-lg hover:opacity-95 transition-opacity duration-200">
          Go to Shop
        </a>
      </div>
    </section>
  )
}