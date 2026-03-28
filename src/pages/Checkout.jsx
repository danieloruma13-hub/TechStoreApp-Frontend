import React, { useState } from 'react';
import { ShieldCheck, Truck, CreditCard, Lock, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore } from '../context/store';
import { fmt } from '../utils/helpers';
import styles from './Checkout.module.css';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal } = useCartStore();
  const { user } = useAuthStore();
  const shipping = subtotal >= 50000 ? 0 : 2500;

  // Form State
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    phone: '',
    paymentMethod: 'card'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic to send to your API (e.g., Paystack/Flutterwave integration)
    console.log("Processing Order:", formData);
  };

  if (items.length === 0) return <Navigate to="/cart" />;

  return (
    <div className="container page-enter" style={{ padding: '3rem 1.25rem' }}>
      <Link to="/cart" className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Cart
      </Link>

      <div className={styles.layout}>
        {/* Left Side: Forms */}
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className="badge badge-purple"><Truck size={12}/> 1</div>
              <h2 className="section-title" style={{ fontSize: '1.2rem' }}>Shipping Details</h2>
            </div>
            
            <div className={styles.grid}>
              <div className="input-group">
                <label className="label">First Name</label>
                <input type="text" className="input" placeholder="Dan" required />
              </div>
              <div className="input-group">
                <label className="label">Last Name</label>
                <input type="text" className="input" placeholder="Code" required />
              </div>
            </div>
            
            <div className="input-group" style={{ marginTop: '1rem' }}>
              <label className="label">Delivery Address</label>
              <input type="text" className="input" placeholder="123 Tech Avenue, Lagos" required />
            </div>

            <div className={styles.grid} style={{ marginTop: '1rem' }}>
              <div className="input-group">
                <label className="label">City</label>
                <input type="text" className="input" placeholder="Ikeja" required />
              </div>
              <div className="input-group">
                <label className="label">Phone Number</label>
                <input type="tel" className="input" placeholder="+234..." required />
              </div>
            </div>
          </section>

          <section className={styles.section} style={{ marginTop: '2rem' }}>
            <div className={styles.sectionHeader}>
              <div className="badge badge-purple"><CreditCard size={12}/> 2</div>
              <h2 className="section-title" style={{ fontSize: '1.2rem' }}>Payment Method</h2>
            </div>
            
            <div className={styles.paymentOptions}>
              <label className={styles.payLabel}>
                <input type="radio" name="pay" defaultChecked />
                <div className={styles.payCard}>
                  <span className="section-title" style={{ fontSize: '1rem' }}>Debit/Credit Card</span>
                  <p className="section-sub">Pay securely with Paystack</p>
                </div>
              </label>
              
              <label className={styles.payLabel}>
                <input type="radio" name="pay" />
                <div className={styles.payCard}>
                  <span className="section-title" style={{ fontSize: '1rem' }}>Bank Transfer</span>
                  <p className="section-sub">Order ships after confirmation</p>
                </div>
              </label>
            </div>
          </section>

          <button type="submit" className="btn btn-accent btn-lg" style={{ width: '100%', marginTop: '2rem' }}>
            Complete Order — {fmt(subtotal + shipping)}
          </button>
        </form>

        {/* Right Side: Order Summary */}
        <aside className={styles.summarySticky}>
          <div className={styles.summaryBox}>
            <h3 className="section-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Your Order</h3>
            <div className={styles.miniList}>
              {items.map(item => (
                <div key={item.id} className={styles.miniItem}>
                  <span className="section-sub">{item.quantity}x</span>
                  <span style={{ flex: 1, fontSize: '0.9rem' }}>{item.name}</span>
                  <span style={{ fontWeight: '600' }}>{fmt(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="divider" style={{ margin: '1rem 0' }} />
            
            <div className="summary-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : fmt(shipping)}</span></div>
            <div className="summary-row summary-total" style={{ marginTop: '0.5rem' }}>
              <span>Total</span>
              <span className="gradient-text">{fmt(subtotal + shipping)}</span>
            </div>

            <div className={styles.secureNote}>
              <Lock size={14} />
              <span>Encrypted Secure Checkout</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
