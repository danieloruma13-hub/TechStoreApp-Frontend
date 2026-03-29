import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/store';
import { toast } from 'react-hot-toast';
import { User, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import styles from './Register.module.css';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword)
      return toast.error("Passwords do not match!")
    if (formData.password.length < 6)
      return toast.error("Password must be at least 6 characters!")

    setLoading(true)
    try {
      const res = await fetch('https://techstoreapp-gobr.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email,
          password: formData.password
        })
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem('ts_token', data.token)
        localStorage.setItem('ts_user', JSON.stringify(data.user))
        useAuthStore.setState({ user: data.user, token: data.token })
        toast.success("Welcome aboard!")
        navigate('/profile')
      } else {
        toast.error(data.message || 'Registration failed')
      }
    } catch (err) {
      toast.error("Network error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-enter" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', padding: '2rem 0' }}>
      <div className="container">
        <div className={styles.authCard}>
          <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 className="section-title" style={{ fontSize: '2rem' }}>Create <span className="gradient-text">Account</span></h1>
            <p className="section-sub">Get exclusive access to pro tech gear.</p>
          </header>

          <form className={styles.form} onSubmit={handleRegister}>
            <div className="input-group">
              <label className="label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--purple-400)' }} />
                <input
                  type="text" className="input" style={{ paddingLeft: '40px' }}
                  placeholder="Dan Code" required
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--purple-400)' }} />
                <input
                  type="email" className="input" style={{ paddingLeft: '40px' }}
                  placeholder="dan@code.com" required
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <ShieldCheck size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--purple-400)' }} />
                <input
                  type="password" className="input" style={{ paddingLeft: '40px' }}
                  placeholder="••••••••" required
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0.5rem 0' }}>
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                I agree to the <span className="gradient-text">Terms of Service</span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={18} />
            </button>
          </form>

          <footer style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p className="section-sub">
              Already have an account? <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Sign In</Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}
