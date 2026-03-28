import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Package, CreditCard, LogOut, Save } from 'lucide-react';
import { useAuthStore } from '../context/store';
import { toast } from 'react-hot-toast';
import styles from './Profile.module.css';

export default function Profile() {
  const { user, logout, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  // Mock Stats for that "Pro" feel
  const stats = [
    { label: 'Total Orders', value: '12', icon: <Package size={18} /> },
    { label: 'Member Since', value: 'Feb 2026', icon: <User size={18} /> },
    { label: 'Points', value: '2,450', icon: <CreditCard size={18} /> },
  ];

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  return (
    <div className="container page-enter" style={{ padding: '4rem 1.25rem' }}>
      <div className={styles.wrapper}>
        
        {/* Sidebar: User Card */}
        <aside className={styles.sidebar}>
          <div className={styles.userCard}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar}>
                {user?.name?.charAt(0) || 'D'}
              </div>
              <div className={styles.statusBadge} />
            </div>
            <h2 className="section-title" style={{ fontSize: '1.4rem', marginTop: '1rem' }}>
              {user?.name || 'Dan Code'}
            </h2>
            <p className="section-sub">Professional Member</p>
            
            <div className="divider" style={{ margin: '1.5rem 0', width: '100%' }} />
            
            <button className="btn btn-ghost" style={{ width: '100%', color: '#ef4444' }} onClick={logout}>
              <LogOut size={18} /> Sign Out
            </button>
          </div>

          <div className={styles.statsGrid}>
            {stats.map((stat, i) => (
              <div key={i} className={styles.statBox}>
                <div style={{ color: 'var(--purple-400)' }}>{stat.icon}</div>
                <div>
                  <div className={styles.statVal}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content: Settings */}
        <main className={styles.mainContent}>
          <div className={styles.settingsHeader}>
            <h1 className="section-title">Account <span className="gradient-text">Settings</span></h1>
            <button 
              className={`btn ${isEditing ? 'btn-primary' : 'btn-outline'} btn-sm`}
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            >
              {isEditing ? <><Save size={16}/> Save Changes</> : 'Edit Profile'}
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSave}>
            <div className={styles.formGrid}>
              <div className="input-group">
                <label className="label">Full Name</label>
                <div className={styles.inputWrapper}>
                  <User size={16} className={styles.inputIcon} />
                  <input type="text" className="input" defaultValue={user?.name} disabled={!isEditing} style={{ paddingLeft: '2.8rem' }} />
                </div>
              </div>

              <div className="input-group">
                <label className="label">Email Address</label>
                <div className={styles.inputWrapper}>
                  <Mail size={16} className={styles.inputIcon} />
                  <input type="email" className="input" defaultValue={user?.email} disabled={!isEditing} style={{ paddingLeft: '2.8rem' }} />
                </div>
              </div>

              <div className="input-group">
                <label className="label">Phone Number</label>
                <div className={styles.inputWrapper}>
                  <Phone size={16} className={styles.inputIcon} />
                  <input type="tel" className="input" placeholder="+234..." disabled={!isEditing} style={{ paddingLeft: '2.8rem' }} />
                </div>
              </div>

              <div className="input-group">
                <label className="label">Default Shipping</label>
                <div className={styles.inputWrapper}>
                  <MapPin size={16} className={styles.inputIcon} />
                  <input type="text" className="input" placeholder="Lagos, Nigeria" disabled={!isEditing} style={{ paddingLeft: '2.8rem' }} />
                </div>
              </div>
            </div>
          </form>

          {/* Security Section */}
          <div className={styles.securityBox}>
            <h3 className="section-title" style={{ fontSize: '1.1rem' }}>Security</h3>
            <p className="section-sub" style={{ marginBottom: '1.5rem' }}>Manage your password and account security preferences.</p>
            <button className="btn btn-outline btn-sm">Change Password</button>
          </div>
        </main>
      </div>
    </div>
  );
}
