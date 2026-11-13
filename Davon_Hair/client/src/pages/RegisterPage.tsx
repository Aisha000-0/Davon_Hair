import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      }).then((r) => {
        if (r.ok) navigate('/login')
        else r.json().then((d) => setError(d.message || 'Registration failed'))
      })
    } catch {
      setError('Registration failed')
    }
  }

  if (useAuth().user) {
    return <p className="text-[var(--champagne)]">You are already signed in.</p>
  }

  return (
    <section className="py-24 bg-[var(--charcoal)] text-[var(--white)] max-w-md mx-auto">
      <div className="p-8 bg-[var(--ink)] rounded-lg border border-charcoal">
        <h2 className="text-3xl font-serif font-bold mb-6">Create an Account</h2>
        {error && <p className="text-[var(--muted-grey)] mb-4">{error}</p>}
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="text-[var(--champagne)] uppercase tracking-wider block mb-2">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-charcoal rounded-lg bg-[var(--charcoal)] text-[var(--white)] focus:outline-none focus:border-[var(--gold)]"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-[var(--champagne)] uppercase tracking-wider block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-charcoal rounded-lg bg-[var(--charcoal)] text-[var(--white)] focus:outline-none focus:border-[var(--gold)]"
              placeholder="hello@devonkwigs.com"
            />
          </div>
          <div>
            <label className="text-[var(--champagne)] uppercase tracking-wider block mb-2">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-3 border border-charcoal rounded-lg bg-[var(--charcoal)] text-[var(--white)] focus:outline-none focus:border-[var(--gold)]"
              placeholder="+234 800 000 0000"
            />
          </div>
          <div>
            <label className="text-[var(--champagne)] uppercase tracking-wider block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-charcoal rounded-lg bg-[var(--charcoal)] text-[var(--white)] focus:outline-none focus:border-[var(--gold)]"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full px-8 py-3 bg-[var(--gold)] text-[var(--ink)] font-serif font-medium text-lg hover:opacity-95 transition-opacity duration-200 focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
          >
            Create Account
          </button>
          <p className="text-sm text-[var(--champagne)] mt-4">
            Already have an account? <a href="/login" className="hover:text-[var(--gold)] transition-colors">Sign In</a>
          </p>
        </form>
      </div>
    </section>
  )
}