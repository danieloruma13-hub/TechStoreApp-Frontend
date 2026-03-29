import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom' // lowercase 'i'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'

import { useAuthStore, useCartStore, useWishlistStore } from './context/store'

// Layout & Components
import Navbar     from './components/layout/Navbar'
import Footer     from './components/layout/Footer'
import CartDrawer from './components/layout/CartDrawer'

// Pages
import Home          from './pages/Home'
import Shop          from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart          from './pages/Cart'
import Checkout      from './pages/Checkout'
import Orders        from './pages/Orders'
import Wishlist      from './pages/Wishlist'
import Profile       from './pages/Profile'
import Login         from './pages/Login'
import Register      from './pages/Register'
// NotFound import removed
import Admin         from './pages/admin/Admin'

// Helper: Auto-scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Guard: Only allow Admins
function AdminGuard({ children }) {
  const { user, token, loading } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (loading || !user) return (
    <div className="empty-page">
      <div className="spinner" />
    </div>
  )
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

// Guard: Redirect logged-in users away from Login/Register
function AuthGuard({ children }) {
  const { token } = useAuthStore()
  return token ? <Navigate to="/profile" replace /> : children
}

// Main Layout Wrapper
function StoreLayout({ children }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      <div className="orb" style={{ width: 700, height: 700, background: 'var(--purple-600)', top: -250, left: -200, opacity: 0.07 }} />
      <div className="orb" style={{ width: 550, height: 550, background: 'var(--yellow-400)', top: '35%', right: -180, opacity: 0.05, animationDelay: '-8s' }} />
      
      <Navbar />
      <CartDrawer />
      
      <main style={{ minHeight: "80vh", position: "relative", zIndex: 1, paddingTop: "64px" }} className="page-enter">
        {children}
      </main>
      <Footer />
      
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            fontFamily: 'var(--font-body)',
            borderRadius: 'var(--r-md)',
            fontSize: '0.875rem'
          },
          success: { iconTheme: { primary: 'var(--purple-500)', secondary: '#fff' } },
          error: { iconTheme: { primary: 'var(--yellow-500)', secondary: '#1a1200' } }
        }} 
      />
    </div>
  )
}

export default function App() {
  const { token, refreshUser } = useAuthStore()
  const { fetchCart }          = useCartStore()
  const { fetchWishlist }      = useWishlistStore()

  useEffect(() => {
    if (token) { 
      refreshUser(); 
      fetchCart(); 
      fetchWishlist(); 
    }
    
    const logoutHandler = () => useAuthStore.getState().logout()
    window.addEventListener('ts:logout', logoutHandler)
    return () => window.removeEventListener('ts:logout', logoutHandler)
  }, [token])

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />

        <Route path="/"               element={<StoreLayout><Home /></StoreLayout>} />
        <Route path="/shop"           element={<StoreLayout><Shop /></StoreLayout>} />
        <Route path="/shop/:category" element={<StoreLayout><Shop /></StoreLayout>} />
        <Route path="/product/:slug"  element={<StoreLayout><ProductDetail /></StoreLayout>} />
        <Route path="/cart"           element={<StoreLayout><Cart /></StoreLayout>} />
        <Route path="/checkout"       element={<StoreLayout><Checkout /></StoreLayout>} />
        <Route path="/orders"         element={<StoreLayout><Orders /></StoreLayout>} />
        <Route path="/wishlist"       element={<StoreLayout><Wishlist /></StoreLayout>} />
        <Route path="/profile"        element={<StoreLayout><Profile /></StoreLayout>} />

        <Route path="/login"          element={<AuthGuard><StoreLayout><Login /></StoreLayout></AuthGuard>} />
        <Route path="/register"       element={<AuthGuard><StoreLayout><Register /></StoreLayout></AuthGuard>} />

        {/* Catch-all: Redirects any undefined route back to Home */}
        <Route path="*"               element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
