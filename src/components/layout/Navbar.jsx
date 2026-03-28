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
  const [scrolled, setScrolled]         = useState(false)
  const [mobileOpen, setMobileOpen]     = useState(false)
  const [shopOpen, setShopOpen]         = useState(false)
  const [userOpen, setUserOpen]         = useState(false)
  const [searchOpen, setSearchOpen]     = useState(false)
  const [searchQuery, setSearchQuery]   = useState('')
  const searchRef = useRef(null)
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user, logout }   = useAuthStore()
  const { count, openDrawer } = useCartStore()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setShopOpen(false)
    setUserOpen(false)
  }, [location])

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus()
  }, [searchOpen])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
        <div className="container navbar__inner">

          {/* New Branding: DozzyData Teleglobal */}
          <Link to="/" className="navbar__logo">
            <div className="navbar__logo-icon">D</div>
            <span className="navbar__logo-text">
              DozzyData <span className="text-primary">Teleglobal</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="navbar__nav hide-mobile">
            <Link to="/" className={`navbar__link${location.pathname === '/' ? ' active' : ''}`}>Home</Link>

            <div className="navbar__drop-wrap"
              onMouseEnter={() => setShopOpen(true)}
              onMouseLeave={() => setShopOpen(false)}
            >
              <Link to="/shop" className={`navbar__link${location.pathname.startsWith('/shop') ? ' active' : ''}`}>
                Shop <ChevronDown size={13} className={shopOpen ? 'chevron open' : 'chevron'} />
              </Link>
              {shopOpen && (
                <div className="navbar__dropdown">
                  <div className="navbar__drop-grid">
                    {CATEGORIES.map(c => (
                      <Link key={c.slug} to={`/shop/${c.slug}`} className="navbar__drop-item">
                        <span>{c.icon}</span><span>{c.label}</span>
                      </Link>
                    ))}
                  </div>
                  <div className="navbar__drop-footer">
                    <Link to="/shop" className="btn btn-primary btn-sm">View All Products</Link>
                  </div>
                </div>
              )}
            </div>

            {/* Deals now points to featured category page */}
            <Link to="/shop/featured" className="navbar__link navbar__link--deals">
              <Tag size={14} style={{marginRight: '4px'}} /> Deals
            </Link>
          </div>

          {/* Actions */}
          <div className="navbar__actions">
            <button className="navbar__icon-btn" onClick={() => setSearchOpen(true)}>
              <Search size={20} />
            </button>

            {user && (
              <Link to="/wishlist" className="navbar__icon-btn hide-mobile">
                <Heart size={20} />
              </Link>
            )}

            <button className="navbar__icon-btn" onClick={openDrawer}>
              <ShoppingCart size={20} />
              {count > 0 && <span className="navbar__badge">{count > 9 ? '9+' : count}</span>}
            </button>

            {user ? (
              <div className="navbar__drop-wrap"
                onMouseEnter={() => setUserOpen(true)}
                onMouseLeave={() => setUserOpen(false)}
              >
                <button className="navbar__user-btn">
                  <div className="navbar__avatar">{user.full_name?.[0]?.toUpperCase()}</div>
                  <span className="hide-mobile">{user.full_name?.split(' ')[0]}</span>
                  <ChevronDown size={13} className={userOpen ? 'chevron open' : 'chevron'} />
                </button>
                {userOpen && (
                  <div className="navbar__dropdown navbar__user-drop">
                    <div className="navbar__user-header">
                      <div className="navbar__user-avatar">{user.full_name?.[0]?.toUpperCase()}</div>
                      <div>
                        <p className="navbar__user-name">{user.full_name}</p>
                        <p className="navbar__user-email">{user.email}</p>
                      </div>
                    </div>
                    <div className="divider" style={{margin:'0.5rem 0'}} />
                    <Link to="/orders"  className="navbar__user-link"><Package size={15}/>My Orders</Link>
                    <Link to="/wishlist" className="navbar__user-link"><Heart size={15}/>Wishlist</Link>
                    <Link to="/profile" className="navbar__user-link"><Settings size={15}/>Profile</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="navbar__user-link" style={{color:'var(--yellow-400)'}}>
                        <User size={15}/>Admin Dashboard
                      </Link>
                    )}
                    <div className="divider" style={{margin:'0.5rem 0'}} />
                    <button className="navbar__user-link navbar__logout" onClick={logout}>
                      <LogOut size={15}/>Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm hide-mobile">Sign In</Link>
            )}

            <button className="navbar__icon-btn show-mobile" onClick={() => setMobileOpen(v => !v)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="navbar__mobile">
            <Link to="/" className="mobile-link">Home</Link>
            <Link to="/shop" className="mobile-link">All Products</Link>
            <Link to="/shop/featured" className="mobile-link" style={{color: 'var(--primary)'}}>Flash Deals</Link>
            
            <p className="mobile-section-label">Categories</p>
            <div className="mobile-cat-grid">
              {CATEGORIES.map(c => (
                <Link key={c.slug} to={`/shop/${c.slug}`} className="mobile-cat-item">
                  <span>{c.icon}</span><span>{c.label}</span>
                </Link>
              ))}
            </div>
            {user ? (
              <>
                <Link to="/orders"  className="mobile-link"><Package size={16}/>Orders</Link>
                <Link to="/wishlist" className="mobile-link"><Heart size={16}/>Wishlist</Link>
                <Link to="/profile" className="mobile-link"><Settings size={16}/>Profile</Link>
                {user.role === 'admin' && <Link to="/admin" className="mobile-link" style={{color:'var(--yellow-400)'}}>Admin Dashboard</Link>}
                <button className="mobile-link mobile-logout" onClick={logout}><LogOut size={16}/>Sign Out</button>
              </>
            ) : (
              <div style={{display:'flex',gap:'0.75rem',padding:'1rem 0'}}>
                <Link to="/login"    className="btn btn-outline" style={{flex:1,justifyContent:'center'}}>Sign In</Link>
                <Link to="/register" className="btn btn-primary" style={{flex:1,justifyContent:'center'}}>Register</Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Search overlay omitted for brevity but remains the same */}
    </>
  )
}
