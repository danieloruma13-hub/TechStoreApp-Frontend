import React, { useState, useEffect } from 'react';
import { Package, ChevronRight, ExternalLink, Clock, CheckCircle, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fmt } from '../utils/helpers';
import styles from './Orders.module.css';

export default function Orders() {
  const [loading, setLoading] = useState(true);

  // Mock Data - In production, fetch this from your api.js using the user token
  const orders = [
    {
      id: "ORD-99281",
      date: "Mar 24, 2026",
      status: "Delivered",
      total: 154000,
      items: ["5G Sim Router Pro", "USB-C Hub"],
      image: "https://via.placeholder.com/80"
    },
    {
      id: "ORD-88210",
      date: "Mar 28, 2026",
      status: "In Transit",
      total: 850000,
      items: ["Pro Gaming Laptop v2"],
      image: "https://via.placeholder.com/80"
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const getStatusBadge = (status) => {
    if (status === 'Delivered') return <span className="badge badge-green"><CheckCircle size={10}/> {status}</span>;
    if (status === 'In Transit') return <span className="badge badge-purple"><Truck size={10}/> {status}</span>;
    return <span className="badge badge-orange"><Clock size={10}/> {status}</span>;
  };

  if (loading) return <div className="empty-page"><div className="spinner" /></div>;

  return (
    <div className="container page-enter" style={{ padding: '4rem 1.25rem' }}>
      <header className="section-header">
        <div>
          <h1 className="page-title">Order <span className="gradient-text">History</span></h1>
          <p className="section-sub">Track and manage your recent tech purchases.</p>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className={styles.empty}>
          <Package size={64} color="var(--text-muted)" />
          <h2 className="section-title">No orders yet</h2>
          <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.meta}>
                  <span className="label" style={{ marginBottom: 0 }}>Order {order.id}</span>
                  <span className="section-sub" style={{ fontSize: '0.8rem' }}>Placed on {order.date}</span>
                </div>
                {getStatusBadge(order.status)}
              </div>

              <div className="divider" style={{ margin: '1.25rem 0' }} />

              <div className={styles.orderBody}>
                <div className={styles.productInfo}>
                  <div className={styles.imgPreview}>
                    <img src={order.image} alt="product" />
                  </div>
                  <div className={styles.details}>
                    <p className="section-title" style={{ fontSize: '1rem' }}>
                      {order.items.join(', ')}
                    </p>
                    <p className="section-sub" style={{ fontSize: '0.85rem' }}>
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className={styles.orderFooter}>
                  <div className={styles.priceInfo}>
                    <span className="section-sub">Total Amount</span>
                    <span className="summary-total" style={{ color: 'var(--text-primary)' }}>{fmt(order.total)}</span>
                  </div>
                  <button className="btn btn-outline btn-sm">
                    View Details <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
