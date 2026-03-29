import React from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';

export function Settings() {
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
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>Organization Profile</h3>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Workspace Name</label>
                  <input type="text" className="form-input" defaultValue="Nexus Internal" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Support Email</label>
                  <input type="email" className="form-input" defaultValue="admin@nexus.ai" />
                </div>
              </div>
              <div className="form-group">
                <label>Data Residency</label>
                <select className="form-input" defaultValue="eu">
                  <option value="us">United States (US East)</option>
                  <option value="eu">Europe (Frankfurt)</option>
                  <option value="asia">Asia Pacific (Tokyo)</option>
                </select>
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <Button variant="primary">Save Changes</Button>
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
                <div style={{ width: '28%', height: '100%', background: '#6366f1', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
