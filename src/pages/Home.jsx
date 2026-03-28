import React from 'react';

const Home = () => {
  return (
    <div className="page-enter">
      {/* Background Decor */}
      <div className="orb" style={{ width: '600px', height: '600px', background: 'rgba(124,58,237,0.08)', top: '-200px', left: '-100px' }}></div>

      {/* Hero Section */}
      <section className="section" style={{ paddingTop: '8rem' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="section-eyebrow">Next-Gen Technology</span>
          <h1 className="page-title" style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', marginTop: '1rem' }}>
            The Future of <br />
            <span className="gradient-text">Mobile & Computing</span>
          </h1>
          <p className="section-sub" style={{ maxWidth: '600px', margin: '1.5rem auto', fontSize: '1.1rem' }}>
            High-speed routers, flagship phones, and pro-grade laptop accessories. 
            Engineered for the Code-with-Dan crew.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2.5rem' }}>
            <button className="btn btn-accent btn-lg">Explore Shop</button>
            <button className="btn btn-outline btn-lg">View Deals</button>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="section-sm">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Browse Categories</h2>
              <p className="section-sub">Find exactly what your setup needs.</p>
            </div>
          </div>
          
          <div className="products-grid">
            {['Phones', 'Sim Routers', 'Laptops', 'Accessories'].map((cat) => (
              <div key={cat} style={{ 
                background: 'var(--bg-card)', 
                padding: '3rem 1.5rem', 
                borderRadius: 'var(--r-xl)', 
                textAlign: 'center',
                border: '1.5px solid var(--border-subtle)',
                transition: 'all var(--ease-base)',
                cursor: 'pointer'
              }} 
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--purple-500)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
              >
                <div className="badge badge-purple" style={{ marginBottom: '1rem' }}>Premium</div>
                <h3 className="section-title" style={{ fontSize: '1.25rem' }}>{cat}</h3>
                <button className="btn btn-ghost btn-sm" style={{ marginTop: '1rem' }}>View All →</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
