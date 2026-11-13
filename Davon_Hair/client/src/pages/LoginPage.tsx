import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { login, reloadUser } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      // Reload user from cookie
      await reloadUser()
    } catch (e: any) {
      setError(e.message || 'Login failed')
    }
  }

  if (useAuth().user) {
    return <p className="text-[var(--champagne)]">You are already signed in.</p>
  }

  return (
    <section className="py-24 bg-[var(--charcoal)] text-[var(--white)] max-w-md mx-auto">
      <div className="p-8 bg-[var(--ink)] rounded-lg border border-charcoal">
        <h2 className="text-3xl font-serif font-bold mb-6">Sign In</h2>
        {error && <p className="text-[var(--muted-grey)] mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-6">
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
            Sign In
          </button>
          <p className="text-sm text-[var(--champagne)] mt-4">
            Don't have an account? <a href="/register" className="hover:text-[var(--gold)] transition-colors">Register</a>
          </p>
        </form>
      </div>
    </section>
  )
}