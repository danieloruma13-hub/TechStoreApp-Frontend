import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag, ShieldCheck, Truck, Zap, Star } from 'lucide-react'
import api from '../utils/api'
import ProductCard from '../components/common/ProductCard'
import './Home.css'

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // This hits your Render backend!
        const res = await api.get('/products?featured=true')
        setFeaturedProducts(res.data.slice(0, 4))
      } catch (err) {
        console.error("Failed to fetch featured products:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  return (
    <div className="home-page">
      {/* --- HERO SECTION --- */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__content">
            <div className="hero__badge">
              <Zap size={14} /> <span>New Season Arrivals</span>
            </div>
            <h1 className="hero__title">
              Welcome to <br />
              <span className="text-primary">DozzyData Teleglobal</span>
            </h1>
            <p className="hero__subtitle">
              Your premium destination for high-end phones, laptops, and ultra-fast 
              telecom solutions. Experience technology without limits.
            </p>
            <div className="hero__actions">
              {/* FIXED: Explore Button */}
              <Link to="/shop" className="btn btn-primary btn-lg">
                Explore Shop <ArrowRight size={18} style={{marginLeft: '8px'}} />
              </Link>
              
              {/* FIXED: Deals Button */}
              <Link to="/shop/featured" className="btn btn-outline btn-lg">
                View Deals
              </Link>
            </div>
          </div>
          
          <div className="hero__image-wrap hide-mobile">
            <div className="hero__image-bg"></div>
            {/* Replace with a real product image later */}
            <img src="/hero-device.png" alt="Featured Tech" className="hero__img" />
          </div>
        </div>
      </section>

      {/* --- FEATURES BAR --- */}
      <section className="features-bar">
        <div className="container features__inner">
          <div className="feature-item">
            <Truck className="text-primary" />
            <div>
              <h4>Fast Delivery</h4>
              <p>Nationwide shipping</p>
            </div>
          </div>
          <div className="feature-item">
            <ShieldCheck className="text-primary" />
            <div>
              <h4>Secure Payment</h4>
              <p>100% Protected</p>
            </div>
          </div>
          <div className="feature-item">
            <Star className="text-primary" />
            <div>
              <h4>Premium Quality</h4>
              <p>Original Brands Only</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURED PRODUCTS --- */}
      <section className="featured-section container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Featured Tech</h2>
            <p className="section-subtitle">Handpicked gadgets for your lifestyle</p>
          </div>
          <Link to="/shop" className="btn btn-ghost">
            See All <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="loading-grid">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-card"></div>)}
          </div>
        ) : (
          <div className="product-grid">
            {featuredProducts.length > 0 ? (
              featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="empty-msg">No featured products found.</p>
            )}
          </div>
        )}
      </section>

      {/* --- PROMO BANNER --- */}
      <section className="promo-banner container">
        <div className="promo__content">
          <h3>Need Bulk Data or SIM Solutions?</h3>
          <p>Contact our Teleglobal team for corporate SIM card setups and router configurations.</p>
          <button className="btn btn-white">Contact Sales</button>
        </div>
      </section>
    </div>
  )
}
