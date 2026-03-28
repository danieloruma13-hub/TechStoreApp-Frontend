import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Star, Zap } from 'lucide-react'
import { useAuthStore, useCartStore, useWishlistStore } from '../../context/store'
import { fmt, discount, firstImage } from '../../utils/helpers'
import toast from 'react-hot-toast'
import './ProductCard.css'

export default function ProductCard({ product }) {
  const [adding,   setAdding]   = useState(false)
  const [imgError, setImgError] = useState(false)
  const { user }        = useAuthStore()
  const { addItem }     = useCartStore()
  const { toggle, has } = useWishlistStore()
  const img    = firstImage(product.images)
  const pct    = discount(product.price, product.compare_price)
  const inWish = user ? has(product.id) : false

  const handleCart = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Sign in to add to cart'); return }
    if (product.stock_quantity < 1) { toast.error('Out of stock'); return }
    setAdding(true)
    await addItem(product.id)
    setAdding(false)
  }

  const handleWish = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Sign in to use wishlist'); return }
    await toggle(product.id)
  }

  return (
    <Link to={`/product/${product.slug}`} className="pcard">
      <div className="pcard-img-wrap">
        {!imgError && img
          ? <img src={img} alt={product.name} className="pcard-img" onError={() => setImgError(true)} />
          : <div className="pcard-img-placeholder">📦</div>
        }
        <div className="pcard-badges">
          {product.is_new && <span className="badge badge-purple">New</span>}
          {pct > 0 && <span className="badge badge-orange">-{pct}%</span>}
          {product.stock_quantity === 0 && <span className="badge badge-red">Sold Out</span>}
          {product.stock_quantity > 0 && product.stock_quantity <= 5 && <span className="badge badge-red">Low Stock</span>}
        </div>
        <button className={`pcard-wish${inWish ? ' active' : ''}`} onClick={handleWish}>
          <Heart size={15} fill={inWish ? 'currentColor' : 'none'} />
        </button>
        <div className="pcard-overlay">
          <button className="btn btn-accent" onClick={handleCart} disabled={adding || product.stock_quantity < 1}>
            {adding ? <span className="spinner" style={{width:16,height:16,borderWidth:2}}/> : <ShoppingCart size={15}/>}
            {product.stock_quantity < 1 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
      <div className="pcard-body">
        {product.brand && <p className="pcard-brand">{product.brand}</p>}
        <h3 className="pcard-name">{product.name}</h3>
        {product.rating > 0 && (
          <div className="pcard-rating">
            <Star size={11} fill="#facc15" color="#facc15"/>
            <span className="pcard-stars">{parseFloat(product.rating).toFixed(1)}</span>
            {product.review_count > 0 && <span className="pcard-reviews">({product.review_count})</span>}
          </div>
        )}
        <div className="pcard-price-row">
          <span className="pcard-price">{fmt(product.price)}</span>
          {product.compare_price > product.price && (
            <>
              <span className="pcard-compare">{fmt(product.compare_price)}</span>
              <span className="pcard-save"><Zap size={10}/>{fmt(product.compare_price - product.price)}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
