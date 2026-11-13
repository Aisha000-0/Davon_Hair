import React, { createContext, useContext, useState, useEffect } from 'react'

type CartItem = {
  variantId: number
  quantity: number
  sku: string
  name: string
  price: number
  image: string
  label: string
}

type CartContextValue = {
  items: CartItem[]
  add: (variantId: number, quantity?: number) => boolean
  remove: (variantId: number) => boolean
  update: (variantId: number, quantity: number) => boolean
  clear: () => void
  subtotal: number
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('devon-cart')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('devon-cart', JSON.stringify(items))
    } catch {
      /* localStorage may be disabled/incoherent */
    }
  }, [items])

  const add = (variantId: number, quantity: number = 1): boolean => {
    const existsIdx = items.findIndex((i) => i.variantId === variantId)
    if (existsIdx >= 0) {
      const newQty = items[existsIdx].quantity + quantity
      if (newQty <= 0) {
        setItems(items.filter((i) => i.variantId !== variantId))
      } else {
        setItems(items.map((i, idx) => (idx === existsIdx ? { ...i, quantity: newQty } : i)))
      }
      return false // updated, not added fresh
    } else {
      setItems([...items, { variantId, quantity, sku: '', name: '', price: 0, image: '', label: '' }])
      return true // newly added
    }
  }

  const remove = (variantId: number) => {
    setItems(items.filter((i) => i.variantId !== variantId))
  }

  const update = (variantId: number, quantity: number) => {
    if (quantity <= 0) {
      remove(variantId)
    } else {
      setItems(
        items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
      )
    }
  }

  const clear = () => setItems([])

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const total = subtotal // delivery fee added at checkout server-side
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, add, remove, update, clear, subtotal, total, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}