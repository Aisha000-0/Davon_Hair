import React, { createContext, useContext } from 'react'

type WishlistContextValue = {
  wishlist: number[] // product IDs
  toggle: (productId: number) => boolean
  isInWishlist: (productId: number) => boolean
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined)

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider')
  return ctx
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('devon-wishlist')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('devon-wishlist', JSON.stringify(wishlist))
    } catch {
      /* best-effort */
    }
  }, [wishlist])

  const toggle = (productId: number): boolean => {
    const exists = wishlist.includes(productId)
    if (exists) {
      setWishlist(wishlist.filter((id) => id !== productId))
      return false
    } else {
      setWishlist([...wishlist, productId])
      return true
    }
  }

  const isInWishlist = (productId: number) => wishlist.includes(productId)

  return (
    <WishlistContext.Provider value={{ wishlist, toggle, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}