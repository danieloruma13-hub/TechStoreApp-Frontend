import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/store';
import { toast } from 'react-hot-toast';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import styles from './Login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      toast.success('Welcome back!');
      if (result.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="container page-enter" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className={styles.authCard}>
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="section-title">Sign <span className="gradient-text">In</span></h1>
          <p className="section-sub">Access your tech account</p>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="input-group">
            <label className="label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--purple-400)' }} />
              <input
                type="email" className="input" style={{ paddingLeft: '40px' }}
                placeholder="dan@code.com" required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--purple-400)' }} />
              <input
                type="password" className="input" style={{ paddingLeft: '40px' }}
                placeholder="••••••••" required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Login Now'} <ArrowRight size={18} />
          </button>
        </form>

        <footer style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p className="section-sub">
            Don't have an account? <Link to="/register" style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Sign Up</Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
