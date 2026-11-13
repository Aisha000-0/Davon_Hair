import React, { useState } from 'react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    if (res.ok) {
      setSent(true)
      setEmail('')
    } else {
      alert(data.message || 'Failed to subscribe')
    }
  }

  return sent ? (
    <section className="py-24 md:py-32 bg-[var(--champagne)]">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-[var(--ink)] text-sm uppercase tracking-wider mb-2">Thanks!</p>
        <h2 className="text-3xl font-serif font-bold">You're on the list.</h2>
        <p className="text-[var(--ink)] mb-6">
          We'll email you about new collections, promotions, and events.
        </p>
      </div>
    </section>
  ) : (
    <section className="py-24 md:py-32 bg-[var(--ink)] text-[var(--white)]">
      <div className="max-w-xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-[var(--champagne)] uppercase tracking-wider mb-2">Join our VIP list</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-charcoal rounded-lg bg-[var(--charcoal)] text-[var(--white)] placeholder-[var(--champagne)] focus:outline-none focus:border-[var(--gold)]"
            placeholder="Enter your email"
          />
          <button
            type="submit"
            className="w-full px-8 py-3 bg-[var(--gold)] text-[var(--ink)] font-serif font-medium text-lg hover:opacity-95 transition-opacity duration-200 focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  )
}