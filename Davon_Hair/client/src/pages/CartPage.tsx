import React from 'react'
import { useCart } from '../contexts/CartContext'
import { useNavigate, useLocation } from 'react-router-dom'

export default function CartPage() {
  const { items, subtotal, total, itemCount, remove, update } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  if (items.length === 0) {
    return (
      <section className="py-24 bg-[var(--charcoal)] text-[var(--white)]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-2xl text-[var(--gold)] mb-4">🛍️</p>
          <h2 className="text-3xl font-serif font-bold">Your bag is empty</h2>
          <p className="text-[var(--smoke)] mb-8">Start browsing our collections to find your perfect wig.</p>
          <a href="/shop" className="inline-block px-8 py-3 bg-[var(--gold)] text-[var(--ink)] font-serif font-medium text-lg hover:opacity-95 transition-opacity duration-200">
            Explore Collection
          </a>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-[var(--charcoal)] text-[var(--white)]">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.variantId}
              className="border-charcoal rounded-lg overflow-hidden py-4 px-6 group"
            >
              <div className="flex items-start">
                <img
                  src={item.image || '/images/placeholder-product.svg'}
                  alt={item.name}
                  className="w-20 h-20 object-cover flex-shrink-0 mr-4"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-serif font-medium text-[var(--white)] line-clamp-2">{item.name}</h3>
                  <p className="text-xs text-[var(--champagne)] mb-1">{item.label}</p>
                  <p className="text-lg font-bold">₦{item.price?.toLocaleString('en-NG') || '0'}</p>
                </div>
              </div>
              <div className="flex items-center mt-3">
                <button
                  onClick={() => update(item.variantId, 1)}
                  disabled={item.quantity >= 20}
                  className="ml-2 inline-block px-2 py-1 bg-[var(--charcoal)] border border-[var(--gold)] text-[var(--gold)] text-sm hover:text-[var(--ink)] transition-colors"
                >
                  +
                </button>
                <span className="ml-4 mr-4 flex items-center min-w-[40px]">
                  {item.quantity}
                </span>
                <button
                  onClick={() => update(item.variantId, -1)}
                  disabled={item.quantity <= 1}
                  className="ml-2 inline-block px-2 py-1 bg-[var(--charcoal)] border border-[var(--gold)] text-[var(--gold)] text-sm hover:text-[var(--ink)] transition-colors"
                >
                  -
                </button>
                <button
                  onClick={() => remove(item.variantId)}
                  className="ml-2 inline-block px-2 py-1 text-[var(--muted-grey)] text-sm hover:text-[var(--white)] transition-colors"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 p-6 border border-charcoal rounded-lg">
          <div className="flex justify-between mb-4">
            <span>Subtotal</span>
            <span>₦{subtotal.toLocaleString('en-NG')}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span>Delivery</span>
            <span>₦0</span>
          </div>
          <div className="flex justify-between font-serif font-bold border-t pt-6 pb-6">
            <span>Total</span>
            <span>₦{total.toLocaleString('en-NG')}</span>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={() => navigate('/checkout')}
            className="w-full px-8 py-3 bg-[var(--gold)] text-[var(--ink)] font-serif font-medium text-lg hover:opacity-95 transition-opacity duration-200 focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </section>
  )
}