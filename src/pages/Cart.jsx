import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../context/store';
import { fmt, firstImage } from '../utils/helpers';
import styles from './Cart.module.css';

export default function Cart() {
  const { items, updateQty, removeItem, subtotal } = useCartStore();
  const shipping = subtotal >= 50000 ? 0 : 2500;

  if (items.length === 0) {
    return (
      <div className="empty-page container">
        <div className="orb" style={{ width: 400, height: 400, background: 'var(--purple-700)', opacity: 0.1 }} />
        <ShoppingBag size={80} color="var(--text-muted)" />
        <h2 className="page-title">Your cart is empty</h2>
        <p className="section-sub">Looks like you haven't added any tech to your setup yet.</p>
        <Link to="/shop" className="btn btn-accent btn-lg">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="container page-enter" style={{ padding: '4rem 1.25rem' }}>
      <h1 className="page-title" style={{ marginBottom: '2rem' }}>
        Shopping <span className="gradient-text">Cart</span>
      </h1>

      <div className={styles.layout}>
        {/* Item List */}
        <div className={styles.itemsList}>
          {items.map((item) => (
            <div key={item.id} className={styles.itemCard}>
              <div className={styles.itemImage}>
                <img src={firstImage(item.images)} alt={item.name} />
              </div>
              
              <div className={styles.itemInfo}>
                <h3 className="section-title" style={{ fontSize: '1.1rem' }}>{item.name}</h3>
                <p className="section-sub" style={{ fontSize: '0.85rem' }}>{item.category}</p>
                <div className={styles.mobilePrice}>{fmt(item.price)}</div>
              </div>

              <div className="qty-wrap">
                <button className="qty-btn" onClick={() => updateQty(item.id, item.quantity - 1)}><Minus size={14}/></button>
                <span className="qty-val">{item.quantity}</span>
                <button className="qty-btn" onClick={() => updateQty(item.id, item.quantity + 1)}><Plus size={14}/></button>
              </div>

              <div className={styles.itemTotal}>
                {fmt(item.price * item.quantity)}
              </div>

              <button className="btn btn-ghost btn-icon" onClick={() => removeItem(item.id)}>
                <Trash2 size={18} color="var(--purple-400)" />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <aside className={styles.summaryCard}>
          <h2 className="section-title" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Order Summary</h2>
          
          <div className="summary-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
          <div className="summary-row">
            <span>Shipping</span>
            <span className={shipping === 0 ? 'free-ship' : ''}>{shipping === 0 ? 'FREE' : fmt(shipping)}</span>
          </div>
          
          <div className="divider" style={{ margin: '1rem 0' }} />
          <div className="summary-row summary-total" style={{ fontSize: '1.4rem' }}>
            <span>Total</span>
            <span className="gradient-text">{fmt(subtotal + shipping)}</span>
          </div>

          <Link to="/checkout" className="btn btn-accent btn-lg" style={{ width: '100%', marginTop: '2rem' }}>
            Proceed to Checkout <ArrowRight size={18} />
          </Link>

          <div className={styles.secureBadge}>
            <ShieldCheck size={16} /> <span>Secure SSL Encrypted Checkout</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
