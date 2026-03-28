import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from './Register.module.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleRegister = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }
    // Logic for your authStore.register(formData)
    toast.success("Welcome to the crew, " + formData.name.split(' ')[0] + "!");
  };

  return (
    <div className="page-enter" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', padding: '2rem 0' }}>
      {/* Decorative Orbs */}
      <div className="orb" style={{ width: '400px', height: '400px', background: 'var(--purple-600)', top: '10%', left: '-5%', opacity: 0.05 }} />
      <div className="orb" style={{ width: '300px', height: '300px', background: 'var(--yellow-400)', bottom: '5%', right: '2%', opacity: 0.04 }} />

      <div className="container">
        <div className={styles.authCard}>
          <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="section-eyebrow">Join the Crew</span>
            <h1 className="section-title" style={{ fontSize: '2rem' }}>Create <span className="gradient-text">Account</span></h1>
            <p className="section-sub">Get exclusive access to pro tech gear.</p>
          </header>

          <form className={styles.form} onSubmit={handleRegister}>
            <div className="input-group">
              <label className="label">Full Name</label>
              <div className={styles.inputWrapper}>
                <User size={18} className={styles.icon} />
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Dan Code" 
                  required 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="label">Email Address</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.icon} />
                <input 
                  type="email" 
                  className="input" 
                  placeholder="dan@code.com" 
                  required 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className={styles.grid}>
              <div className="input-group">
                <label className="label">Password</label>
                <div className={styles.inputWrapper}>
                  <Lock size={18} className={styles.icon} />
                  <input 
                    type="password" 
                    className="input" 
                    placeholder="••••••••" 
                    required 
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="label">Confirm</label>
                <div className={styles.inputWrapper}>
                  <ShieldCheck size={18} className={styles.icon} />
                  <input 
                    type="password" 
                    className="input" 
                    placeholder="••••••••" 
                    required 
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className={styles.terms}>
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">I agree to the <span className="gradient-text">Terms of Service</span></label>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1rem' }}>
              Create Account <ArrowRight size={18} />
            </button>
          </form>

          <footer className={styles.footer}>
            <p className="section-sub">
              Already have an account? <Link to="/login" className={styles.link}>Sign In</Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
