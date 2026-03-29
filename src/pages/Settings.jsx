import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../context/AuthContext';

export function Settings() {
  const { user } = useAuth();
  const { updateProfile, loading } = useSettings();
  
  // Local state for forms
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    residency: 'eu'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    await updateProfile({
      name: profileData.name,
      email: profileData.email,
      residency: profileData.residency
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      // Toast inherited from useSettings but we can call it manually if needed
      return; 
    }
    await updateProfile({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 className="dashboard-title">Platform Settings</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '600px', lineHeight: 1.5 }}>
              Manage your SaaS billing architecture, team access controls, and organization-wide security boundaries from a central hub.
            </p>
          </div>
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '800px', gap: '2rem' }}>
          
          <div className="dashboard-panel">
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>Account Profile</h3>
            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={profileData.name} 
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    value={profileData.email} 
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Default Core Region (Data Residency)</label>
                <select 
                  className="form-input" 
                  value={profileData.residency}
                  onChange={(e) => setProfileData({...profileData, residency: e.target.value})}
                >
                  <option value="us">United States (US East)</option>
                  <option value="eu">Europe (Frankfurt)</option>
                  <option value="asia">Asia Pacific (Tokyo)</option>
                </select>
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Encrypting Space...' : 'Save Profile Changes'}
                </Button>
              </div>
            </form>
          </div>

          <div className="dashboard-panel">
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>Security & Auth</h3>
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••" 
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>New Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Min 8 chars"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Confirm New Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Repeat password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <Button variant="outline" type="submit" disabled={loading}>
                  {loading ? 'Validating Keys...' : 'Update Password securely'}
                </Button>
              </div>
            </form>
          </div>

          <div className="dashboard-panel">
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>Billing & Usage</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ fontWeight: 600 }}>Professional Plan</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>$49/mo • Renews on Nov 14, 2026</p>
              </div>
              <Button variant="outline">Manage Plan</Button>
            </div>
            
            <div style={{ background: 'var(--surface-light)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 500 }}>Global Agent Executions</span>
                <span>14,209 / 50,000</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(15, 23, 42, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '28%', height: '100%', background: 'var(--primary-gradient)', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
