import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, ArrowRight, Ghost } from 'lucide-react';
import { useWishlistStore, useCartStore } from '../context/store';
import { fmt, firstImage } from '../utils/helpers';
import { toast } from 'react-hot-toast';
import styles from './Wishlist.module.css';

export default function Wishlist() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();

  const handleMoveToCart = (item) => {
    addToCart(item);
    removeItem(item.id);
    toast.success('Moved to cart!');
  };

  if (items.length === 0) {
    return (
      <div className="empty-page container page-enter">
        <div className="orb" style={{ width: 400, height: 400, background: 'var(--purple-600)', opacity: 0.08 }} />
        <Heart size={64} color="var(--text-muted)" strokeWidth={1.5} />
        <h2 className="page-title">Wishlist is <span className="gradient-text">Empty</span></h2>
        <p className="section-sub">Save your favorite tech gear here to track them later.</p>
        <Link to="/shop" className="btn btn-primary btn-lg" style={{ marginTop: '1.5rem' }}>
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container page-enter" style={{ padding: '4rem 1.25rem' }}>
      <header className="section-header">
        <div>
          <div className="section-eyebrow">Personal Collection</div>
          <h1 className="page-title">My <span className="gradient-text">Wishlist</span></h1>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={clearWishlist} style={{ color: 'var(--purple-400)' }}>
          Clear All
        </button>
      </header>

      <div className="products-grid" style={{ marginTop: '2.5rem' }}>
        {items.map((item) => (
          <div key={item.id} className={styles.wishCard}>
            {/* Image Section */}
            <div className={styles.imageWrapper}>
              <Link to={`/product/${item.slug}`}>
                <img src={firstImage(item.images)} alt={item.name} className={styles.img} />
              </Link>
              <button 
                className={styles.removeBtn} 
                onClick={() => removeItem(item.id)}
                title="Remove from wishlist"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Content Section */}
            <div className={styles.content}>
              <div className={styles.meta}>
                <span className="badge badge-purple">{item.category || 'Tech'}</span>
                <span className="summary-total" style={{ color: 'var(--yellow-400)' }}>{fmt(item.price)}</span>
              </div>
              
              <h3 className="section-title" style={{ fontSize: '1.1rem', margin: '0.75rem 0' }}>
                {item.name}
              </h3>

              <div className={styles.actions}>
                <button 
                  className="btn btn-accent btn-sm" 
                  style={{ width: '100%' }}
                  onClick={() => handleMoveToCart(item)}
                >
                  <ShoppingCart size={16} /> Add to Cart
                </button>
                <Link 
                  to={`/product/${item.slug}`} 
                  className="btn btn-outline btn-sm" 
                  style={{ padding: '0.42rem' }}
                >
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
