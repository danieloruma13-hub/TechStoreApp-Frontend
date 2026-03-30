import React, { useState } from 'react';
import { User, Mail, Phone, Package, CreditCard, LogOut, Save, Edit2 } from 'lucide-react';
import { useAuthStore } from '../context/store';
import { toast } from 'react-hot-toast';
import styles from './Profile.module.css';

export default function Profile() {
  const { user, logout, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || ''
  });

  const handleSave = async (e) => {
    e.preventDefault();
    const result = await updateProfile(form);
    if (result.success) {
      toast.success('Profile updated!');
      setIsEditing(false);
    } else {
      toast.error(result.message);
    }
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en', { month: 'short', year: 'numeric' })
    : 'N/A';

  return (
    <div className="container page-enter" style={{ padding: '2rem 1.25rem' }}>
      <div className={styles.wrapper}>

        <aside className={styles.sidebar}>
          <div className={styles.userCard}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar}>
                {user?.full_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className={styles.statusBadge} />
            </div>
            <h2 className="section-title" style={{ fontSize: '1.4rem', marginTop: '1rem' }}>
              {user?.full_name || 'User'}
            </h2>
            <p className="section-sub">{user?.role === 'admin' ? 'Administrator' : 'Member'}</p>

            <div className="divider" style={{ margin: '1.5rem 0', width: '100%' }} />

            <button className="btn btn-ghost" style={{ width: '100%', color: '#ef4444' }} onClick={logout}>
              <LogOut size={18} /> Sign Out
            </button>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <div style={{ color: 'var(--purple-400)' }}><Package size={18}/></div>
              <div>
                <div className={styles.statVal}>0</div>
                <div className={styles.statLabel}>TOTAL ORDERS</div>
              </div>
            </div>
            <div className={styles.statBox}>
              <div style={{ color: 'var(--purple-400)' }}><User size={18}/></div>
              <div>
                <div className={styles.statVal}>{memberSince}</div>
                <div className={styles.statLabel}>MEMBER SINCE</div>
              </div>
            </div>
            <div className={styles.statBox}>
              <div style={{ color: 'var(--purple-400)' }}><CreditCard size={18}/></div>
              <div>
                <div className={styles.statVal}>0</div>
                <div className={styles.statLabel}>POINTS</div>
              </div>
            </div>
          </div>
        </aside>

        <main className={styles.mainContent}>
          <div className={styles.settingsHeader}>
            <h1 className="section-title">Account <span className="gradient-text">Settings</span></h1>
            <button
              className={`btn ${isEditing ? 'btn-primary' : 'btn-outline'} btn-sm`}
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            >
              {isEditing ? <><Save size={16}/> Save</> : <><Edit2 size={16}/> Edit</>}
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSave}>
            <div className={styles.formGrid}>
              <div className="input-group">
                <label className="label">Full Name</label>
                <div className={styles.inputWrapper}>
                  <User size={16} className={styles.inputIcon}/>
                  <input
                    type="text" className="input"
                    style={{ paddingLeft: '2.8rem' }}
                    value={form.full_name}
                    disabled={!isEditing}
                    onChange={e => setForm({...form, full_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="label">Email Address</label>
                <div className={styles.inputWrapper}>
                  <Mail size={16} className={styles.inputIcon}/>
                  <input
                    type="email" className="input"
                    style={{ paddingLeft: '2.8rem' }}
                    value={user?.email || ''}
                    disabled
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="label">Phone Number</label>
                <div className={styles.inputWrapper}>
                  <Phone size={16} className={styles.inputIcon}/>
                  <input
                    type="tel" className="input"
                    style={{ paddingLeft: '2.8rem' }}
                    placeholder="+234..."
                    value={form.phone}
                    disabled={!isEditing}
                    onChange={e => setForm({...form, phone: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </form>

          <div className={styles.securityBox}>
            <h3 className="section-title" style={{ fontSize: '1.1rem' }}>Account Info</h3>
            <p className="section-sub">Role: <strong style={{color:'var(--purple-400)'}}>{user?.role}</strong></p>
            <p className="section-sub">Email: <strong style={{color:'var(--text-primary)'}}>{user?.email}</strong></p>
          </div>
        </main>
      </div>
    </div>
  );
}
