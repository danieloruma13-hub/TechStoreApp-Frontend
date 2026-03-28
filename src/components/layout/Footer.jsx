import React from 'react';
import { Link } from 'react-router-dom';
// Removed Instagram, Twitter, etc. and added Share2 as a placeholder
import { Mail, Phone, MapPin, Share2 } from 'lucide-react'; 
import './Footer.css';

const SHOP = [['Phones','phones'],['Laptops','laptops'],['SIM Routers','sim-routers'],['Portable WiFi','portable-wifi'],['Power Banks','power-banks'],['Earbuds','earbuds'],['Gaming','gaming'],['Accessories','accessories']];
const ACCOUNT = [['My Account','/profile'],['My Orders','/orders'],['Wishlist','/wishlist'],['Cart','/cart'],['Sign In','/login'],['Register','/register']];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__glow" />
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <div className="footer__logo-icon">T</div>
              <span>Tech<span>Store</span></span>
            </Link>
            <p className="footer__tagline">Your premium destination for the latest tech in Nigeria.</p>
            <div className="footer__socials">
              {/* Using a generic Share2 icon for all socials to stop the crash */}
              {['Instagram', 'Twitter', 'Facebook', 'YouTube'].map((label) => (
                <a key={label} href="#" className="social-btn" aria-label={label}>
                  <Share2 size={18}/>
                </a>
              ))}
            </div>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Shop</h4>
            <ul className="footer__links">
              {SHOP.map(([label, slug]) => <li key={label}><Link to={`/shop/${slug}`}>{label}</Link></li>)}
            </ul>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Account</h4>
            <ul className="footer__links">
              {ACCOUNT.map(([label, path]) => <li key={label}><Link to={path}>{label}</Link></li>)}
            </ul>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Contact</h4>
            <ul className="footer__contact">
              <li><MapPin size={15}/><span>Lagos, Nigeria</span></li>
              <li><Phone size={15}/><span>+234 800 123 4567</span></li>
              <li><Mail size={15}/><span>support@techstore.ng</span></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
