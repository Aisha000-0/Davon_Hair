import React from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { CartProvider } from './contexts/CartContext'
import { AuthProvider } from './contexts/AuthContext'
import { WishlistProvider } from './contexts/WishlistContext'
import NewsletterForm from './components/client/Newsletter'
import Footer from './components/client/Footer'
import HeroSection from './components/client/HeroSection'
import ShopSection from './components/client/ShopSection'
import BestSellersSection from './components/client/BestSellersSection'
import NewArrivalsSection from './components/client/NewArrivalsSection'
import TrendingSection from './components/client/TrendingSection'
import PromoBanner from './components/client/PromoBanner'
import FeaturedCollectionsSection from './components/client/FeaturedCollectionsSection'
import WhyShopSection from './components/client/WhyShopSection'
import TestimonialsSection from './components/client/TestimonialsSection'
import SocialGallerySection from './components/client/SocialGallerySection'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { AdminRoute } from './routes/AdminRoute'
import Account from './pages/Account'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ConfirmationPage from './pages/ConfirmationPage'
import OrderTracking from './pages/OrderTracking'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import NotFound from './pages/NotFound'

function App() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <CartProvider>
      <AuthProvider>
        <WishlistProvider>
          <Routes location={location} navigate={navigate}>
            {/* Public storefront */}
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/confirmation/:orderNumber" element={<ConfirmationPage />} />
            <Route path="/order-tracking" element={<OrderTracking />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/newsletter" element={<NewsletterForm />} />

            {/* Protected routes (customer) */}
            <Route path="/account" element={<Account />} />
            <Route path="/order/:orderNumber" element={<OrderDetail />} />

            {/* Admin routes */}
            <AdminRoute path="/admin/dashboard" element={<AdminDashboard />} />
            <AdminRoute path="/admin/orders" element={<AdminOrders />} />
            <AdminRoute path="/admin/orders/:orderNumber" element={<AdminOrderDetail />} />
            <AdminRoute path="/admin/products" element={<AdminProducts />} />
            <AdminRoute path="/admin/categories" element={<AdminCategories />} />
            <AdminRoute path="/admin/settings" element={<AdminSettings />} />
            <AdminRoute path="/admin/customers" element={<AdminCustomers />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </WishlistProvider>
      </AuthProvider>
    </CartProvider>
  )
}

export default App

function HomePage() {
  const navigate = useNavigate()
  return (
    <div>
      {/* Redirect / to /shop for SEO / initial landing */}
      <nav className="hidden sm:block">
        <a href="/shop" onClick={(e) => { e.preventDefault(); navigate('/shop') }} className="text-sm text-[var(--champagne)] hover:text-[var(--gold)]">
          Skip to shop
        </a>
      </nav>
      <HeroSection />
    </div>
  )
}