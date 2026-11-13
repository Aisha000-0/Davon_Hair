import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

export default function AccountPage() {
  const { user, logout, reloadUser } = useAuth()
  const { itemCount } = useCart()

  if (!user) return null

  return (
    <div className="py-24 bg-[var(--charcoal)] text-[var(--white)]">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-serif font-bold">My Account</h2>
          <button
            onClick={logout}
            className="text-sm text-[var(--champagne)] hover:underline"
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-sm text-[var(--champagne)] uppercase tracking-widest mb-4">Profile</h3>
            <p className="text-[var(--smoke)]">
              Email: {user.email}{' '}
              {user.phone ? `• Phone: ${user.phone}` : ''}
            </p>
          </div>

          <div>
            <h3 className="text-sm text-[var(--champagne)] uppercase tracking-widest mb-4">Cart</h3>
            <p className="text-[var(--smoke)]">
              Items: {itemCount > 0 ? itemCount : '0'}{' '}
              {itemCount > 0 ? (
                <a href="/cart" className="text-[var(--champagne)] hover:underline">
                  View bag
                </a>
              ) : null}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-charcoal">
          <h3 className="text-sm text-[var(--champagne)] uppercase tracking-widest mb-4">Order History</h3>
          <p className="text-[var(--smoke)] text-sm">
            Track your orders, view details, and download payment evidence.
          </p>
          <ul className="space-y-3">
            <li className="cursor-pointer hover:text-[var(--champagne)] transition-colors">
              Order #DK-20240115-AB12 — ₦245,000 — Awaiting verification
            </li>
            <li className="cursor-pointer hover:text-[var(--champagne)] transition-colors">
              Order #DK-20240220-CD34 — ₦310,000 — Delivered
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}