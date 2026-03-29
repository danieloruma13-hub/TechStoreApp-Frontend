import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Heart, Search, Menu, X, ChevronDown, User, Package, LogOut, Settings, Tag } from 'lucide-react'
import { useAuthStore, useCartStore } from '../../context/store'
import './Navbar.css'

const CATEGORIES = [
  { label: 'Phones',        slug: 'phones',        icon: '📱' },
  { label: 'Laptops',       slug: 'laptops',       icon: '💻' },
  { label: 'SIM Routers',   slug: 'sim-routers',   icon: '📡' },
  { label: 'SIM Cards',     slug: 'sim-cards',     icon: '📶' },
  { label: 'Portable WiFi', slug: 'portable-wifi', icon: '🌐' },
  { label: 'Power Banks',   slug: 'power-banks',   icon: '🔋' },
  { label: 'Earbuds',       slug: 'earbuds',       icon: '🎧' },
  { label: 'Gaming',        slug: 'gaming',        icon: '🎮' },
  { label: 'Accessories',   slug: 'accessories',   icon: '🔌' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { count, openDrawer } = useCartStore()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [location])

  return (
    <>
      <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
        <div className="container navbar__inner">
          <Link to="/" className="navbar__logo">
            <div className="navbar__logo-icon">D</div>
            <span className="navbar__logo-text">DozzyData <span className="brand-gradient-text">Teleglobal</span></span>
          </Link>

          <div className="navbar__nav hide-mobile">
            <Link to="/" className="navbar__link">Home</Link>
            <Link to="/shop" className="navbar__link">Shop</Link>
            <Link to="/shop/featured" className="navbar__link navbar__link--deals">Deals</Link>
          </div>

          <div className="navbar__actions">
            <button className="navbar__icon-btn" onClick={openDrawer}>
              <ShoppingCart size={22} />
              {count > 0 && <span className="navbar__badge">{count}</span>}
            </button>

            {/* Hamburger Button */}
            <button className="navbar__icon-btn show-mobile" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            
            {user ? (
               <Link to="/profile" className="navbar__avatar hide-mobile">
                 {user.full_name?.[0]}
               </Link>
            ) : (
               <Link to="/login" className="btn btn-primary btn-sm hide-mobile">Sign In</Link>
            )}
          </div>
        </div>
      </nav>

      {/* --- MOBILE SIDEBAR --- */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)}>
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="sidebar__header">
            <span className="sidebar__title">Menu</span>
            <button className="sidebar__close" onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <div className="sidebar__content">
            <Link to="/" className="sidebar__link">Home</Link>
            <Link to="/shop" className="sidebar__link">All Products</Link>
            <Link to="/shop/featured" className="sidebar__link sidebar__link--highlight">Flash Deals <Tag size={14}/></Link>
            
            <div className="sidebar__divider">Categories</div>
            <div className="sidebar__cat-grid">
              {CATEGORIES.map(c => (
                <Link key={c.slug} to={`/shop/${c.slug}`} className="sidebar__cat-item">
                  {c.icon} {c.label}
                </Link>
              ))}
            </div>

            <div className="sidebar__divider">Account</div>
            {user ? (
              <>
                <Link to="/orders" className="sidebar__link">My Orders</Link>
                <Link to="/profile" className="sidebar__link">Settings</Link>
                <button className="sidebar__link logout-btn" onClick={logout}>Sign Out</button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary w-full">Sign In / Register</Link>
            )}
          </div>
        </aside>
      </div>
    </>
  )
}
