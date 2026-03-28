import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './CategoryPage.module.css';

const CategoryPage = () => {
  const { categoryName } = useParams(); // e.g., 'phones' or 'laptops'
  const [loading, setLoading] = useState(true);

  // Simulate a data fetch
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [categoryName]);

  return (
    <div className="page-enter">
      {/* Background Decorative Orbs (using your .orb class) */}
      <div className="orb" style={{ width: '400px', height: '400px', background: 'rgba(124,58,237,0.15)', top: '-10%', right: '-5%' }}></div>
      
      <div className="container">
        <header className="section-header" style={{ marginTop: '2rem' }}>
          <div>
            <div className="section-eyebrow">Premium Collection</div>
            <h1 className="page-title">
              Shop <span className="gradient-text">{categoryName}</span>
            </h1>
            <p className="section-sub">High-performance gear curated for professionals.</p>
          </div>
          <div className="hide-mobile">
            <button className="btn btn-outline btn-sm">Filter Results</button>
          </div>
        </header>

        <div className={styles.layout}>
          {/* Sidebar Filter - Consistent with your .bg-card style */}
          <aside className={styles.sidebar}>
            <div className={styles.filterSection}>
              <span className="label">Price Range</span>
              <input type="range" className={styles.rangeInput} />
            </div>
            
            <div className={styles.filterSection}>
              <span className="label">Availability</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" /> <span className="section-sub">In Stock</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" /> <span className="section-sub">Pre-order</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Product Grid using your .products-grid class */}
          <main className="products-grid">
            {loading ? (
              // Loading Skeletons using your .skeleton class
              [...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: '320px' }}></div>)
            ) : (
              // Mock Product Mapping
              [1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className={styles.productCard}>
                  <div className={styles.imageWrapper}>
                    <div className="badge badge-purple" style={{ position: 'absolute', top: '10px', left: '10px' }}>New</div>
                    <img src={`https://via.placeholder.com/300x300?text=${categoryName}`} alt="Product" />
                  </div>
                  <div className={styles.productDetails}>
                    <h3 className="section-title" style={{ fontSize: '1.1rem' }}>Pro {categoryName.slice(0, -1)} v{item}</h3>
                    <p className="section-sub" style={{ fontSize: '0.8rem' }}>Ultra-slim design with peak performance.</p>
                    <div className={styles.priceRow}>
                      <span className="summary-total">$999.00</span>
                      <button className="btn btn-accent btn-sm">Add</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
