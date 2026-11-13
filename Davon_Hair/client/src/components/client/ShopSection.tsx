import React from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useCart } from '../contexts/CartContext'

export default function ShopSection() {
  const { category } = useParams<{ category: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  // Simple client-side filtering using a basic query; real filtering happens server-side.
  const { data, isLoading } = useQuery(
    ['products', { category, location: location.key }],
    async () => {
      const res = await fetch(`/api/catalog/products?category=${category || 'all'}`)
      if (!res.ok) throw new Error('Failed to load products')
      return res.json()
    },
    { staleTime: 5 * 60_000 }
  )

  const { add } = useCart()

  if (isLoading) return (
    <section className="py-24 bg-[var(--charcoal)]">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-sm text-[var(--champagne)] uppercase tracking-widest mb-4">Loading…</p>
        <h2 className="text-3xl font-serif font-bold">YOUR BEAUTY. YOUR CROWN. YOUR LUXURY.</h2>
        <p>Loading products…</p>
      </div>
    </section>
  )

  const products = data?.products ?? []
  const facets = data?.facets ?? { hairTypes: [], textures: [], priceMin: 0, priceMax: 0 }

  return (
    <section className="py-24 bg-[var(--charcoal)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p: any) => (
            <article
              key={p.id}
              className="group border border-charcoal rounded-lg overflow-hidden hover-shadow-xl transition-shadow duration-300"
            >
              <a href={`/product/${p.slug}`} className="block">
                <img
                  src={p.image || '/images/placeholder-product.svg'}
                  alt={p.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-sm font-serif font-medium text-[var(--white)] line-clamp-2">{p.name}</h3>
                  <p className="text-xs text-[var(--champagne)] mt-1">{p.hairType ?? 'Human Hair'}</p>
                  <p className="text-lg font-bold mt-2">{p.price?.toLocaleString('en-NG') || '₦0'}</p>
                </div>
              </a>
            </article>
          ))}
          {products.length === 0 && (
            <p className="col-span-full text-[var(--muted-grey)] text-center py-12">
              No products found in this category.
            </p>
          )}
        </div>

        {/* Facets sidebar on larger screens */}
        {category && (
          <div className="mt-8 sm:mt-0 sm:w-64 border-t border-charcoal pt-8">
            <h3 className="text-sm font-serif font-bold text-[var(--champagne)] uppercase tracking-wider mb-4">Filter</h3>
            <div className="space-y-3">
              <p className="text-sm text-[var(--muted-grey)]">Hair type</p>
              {/* Simplified: in a full impl these would be checkboxes / range inputs */}
              <p className="text-xs text-[var(--champagne)] cursor-pointer hover:underline">All hair types</p>
              <p className="text-xs text-[var(--champagne)] cursor-pointer hover:underline">Straight</p>
              <p className="text-xs text-[var(--champagne)] cursor-pointer hover:underline">Wavy</p>
              <p className="text-xs text-[var(--champagne)] cursor-pointer hover:underline">Curly</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}