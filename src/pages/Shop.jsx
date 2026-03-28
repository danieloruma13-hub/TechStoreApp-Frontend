import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCartStore } from '../context/store';
import { toast } from 'react-hot-toast';
import styles from './Shop.module.css';

const Shop = () => {
  const { category } = useParams(); // Detects 'phones', 'laptops', etc.
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((state) => state.addToCart);

  // Simulate API Fetching
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [category]);

  return (
    <div className="container page-enter">
      {/* Category Header */}
      <header className="section-header" style={{ marginTop: '3rem' }}>
        <div>
          <div className="section-eyebrow">
            {category ? `Category / ${category}` : 'All Products'}
          </div>
          <h1 className="page-title">
            Browse <span className="gradient-text">{category || 'Collection'}</span>
          </h1>
        </div>
        <div className="hide-mobile">
          <span className="section-sub">24 Items found</span>
        </div>
      </header>

      <div className={styles.layout}>
        {/* Sidebar Filters */}
        <aside className={styles.sidebar}>
          <div className={styles.filterBox}>
            <span className="label">Price Filter</span>
            <input type="range" min="0" max="2000" className={styles.rangeInput} />
            <div className="summary-row">
              <span>$0</span>
              <span>$2,000</span>
            </div>
          </div>

          <div className={styles.filterBox}>
            <span className="label">Availability</span>
            <div className={styles.checkGroup}>
              <label><input type="checkbox" /> <span>In Stock</span></label>
              <label><input type="checkbox" /> <span>On Sale</span></label>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="products-grid">
          {loading ? (
            // Use your .skeleton class from global CSS
            [...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: '350px' }} />)
          ) : (
            // Product Cards
            [1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className={styles.card}>
                <Link to={`/product/item-${item}`} className={styles.imageBox}>
                  <div className="badge badge-purple" style={{ position: 'absolute', top: 12, left: 12 }}>Pro</div>
                  <img src={`https://via.placeholder.com/400x400?text=${category || 'Tech'}`} alt="Product" />
                </Link>
                
                <div className={styles.details}>
                  <h3 className="section-title" style={{ fontSize: '1.1rem' }}>Flagship {category || 'Device'} X{item}</h3>
                  <div className={styles.footer}>
                    <span className="summary-total">$899.00</span>
                    <button 
                      className="btn btn-accent btn-sm"
                      onClick={() => {
                        addToCart({ id: item, name: 'Flagship Device', price: 899 });
                        toast.success('Added to cart');
                      }}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
