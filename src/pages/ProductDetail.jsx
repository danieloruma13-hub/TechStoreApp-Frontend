import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCartStore, useWishlistStore } from '../context/store';
import { toast } from 'react-hot-toast';
import styles from './ProductDetail.module.css';

const ProductDetail = () => {
  const { slug } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs');
  
  // Connect to your stores
  const addToCart = useCartStore((state) => state.addToCart);
  const addToWishlist = useWishlistStore((state) => state.addToWishlist);

  // Mock Data - In production, fetch this from your api.js using the slug
  const product = {
    name: "Ultra-Fast 5G Sim Router Pro",
    price: 299.99,
    description: "Experience lightning-fast internet anywhere. Supports all major carriers with dual-band Wi-Fi 6 technology.",
    category: "Sim Routers",
    stock: 15,
    specs: {
      speed: "3.0 Gbps",
      ports: "4x Gigabit Ethernet",
      coverage: "Up to 3000 sq ft",
      warranty: "2 Years"
    }
  };

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="page-enter container">
      <div className={styles.wrapper}>
        
        {/* Left: Image Gallery */}
        <div className={styles.imageSection}>
          <div className="badge badge-purple" style={{ marginBottom: '1rem' }}>Best Seller</div>
          <div className={styles.mainImage}>
             <img src="https://via.placeholder.com/600x600?text=Product+Image" alt={product.name} />
          </div>
        </div>

        {/* Right: Product Info */}
        <div className={styles.infoSection}>
          <span className="section-eyebrow">{product.category}</span>
          <h1 className="page-title">{product.name}</h1>
          
          <div className={styles.priceRow}>
            <span className="summary-total" style={{ fontSize: '2rem', color: 'var(--yellow-400)' }}>
              ${product.price}
            </span>
            <span className="badge badge-green">In Stock</span>
          </div>

          <p className="section-sub" style={{ margin: '1.5rem 0' }}>
            {product.description}
          </p>

          <div className="divider" style={{ margin: '2rem 0' }} />

          {/* Action Row */}
          <div className={styles.actions}>
            <div className="qty-wrap">
              <button 
                className="qty-btn" 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
              > - </button>
              <span className="qty-val">{quantity}</span>
              <button 
                className="qty-btn" 
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
              > + </button>
            </div>

            <button className="btn btn-accent btn-lg" onClick={handleAddToCart} style={{ flex: 1 }}>
              Add to Cart
            </button>
            
            <button className="btn btn-outline btn-icon" onClick={() => addToWishlist(product)}>
              ❤
            </button>
          </div>

          {/* Tabs Section */}
          <div className={styles.tabsContainer}>
            <div className={styles.tabsHeader}>
              <button 
                className={activeTab === 'specs' ? styles.activeTab : ''} 
                onClick={() => setActiveTab('specs')}
              >Specifications</button>
              <button 
                className={activeTab === 'shipping' ? styles.activeTab : ''} 
                onClick={() => setActiveTab('shipping')}
              >Shipping Info</button>
            </div>
            
            <div className={styles.tabContent}>
              {activeTab === 'specs' && (
                <div className={styles.specsGrid}>
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="summary-row">
                      <span style={{ textTransform: 'capitalize' }}>{key}</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{val}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'shipping' && (
                <p className="section-sub">Free express shipping for Code-with-Dan members. Estimated delivery: 2-4 business days.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
