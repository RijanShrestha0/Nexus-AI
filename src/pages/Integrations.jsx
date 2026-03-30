import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/layout/Sidebar';
import { GitBranch, Hash, Database, Mail, Link as LinkIcon, Loader2, X, Key, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useIntegrations } from '../hooks/useIntegrations';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const integrationsMeta = [
  { id: 'slack', name: 'Slack', desc: 'Allow agents to send alerts and communicate in channels.', icon: Hash },
  { id: 'github', name: 'GitHub', desc: 'Securely map your codebase context to your engineering agents.', icon: GitBranch },
  { id: 'postgres', name: 'PostgreSQL', desc: 'Connect internal databases for autonomous SQL queries.', icon: Database },
  { id: 'gmail', name: 'Google Workspace', desc: 'Enable agents to draft, read, and categorize your support emails.', icon: Mail }
];

export function Integrations() {
  const { integrations, toggleConnection, loading } = useIntegrations();
  const { token } = useAuth();
  const { addToast } = useToast();
  
  // Modal State
  const [modalType, setModalType] = useState(null); // 'github' | 'gmail'
  const [tokenInput, setTokenInput] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);

  const handleLink = async () => {
    if (!tokenInput) return;
    setLinkLoading(true);
    
    // Determine mapping endpoint
    const endpoint = modalType === 'github' ? 'github/link' : 'google/link';
    
    try {
      const response = await fetch(`http://localhost:5005/api/dashboard/integrations/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ accessToken: tokenInput })
      });
      
      const data = await response.json();

      if (response.ok) {
        addToast(data.message || 'Mapping successful!', 'success');
        setTokenInput('');
        setModalType(null);
        // Refresh local UI state
        setTimeout(() => window.location.reload(), 1500);
      } else {
        addToast(data.error || 'Identity verification failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Critical platform communication failure.', 'error');
    } finally {
      setLinkLoading(false);
    }
  };

  const onToggleClick = (id) => {
     if ((id === 'github' || id === 'gmail') && !integrations[id]) {
        setModalType(id);
     } else {
        toggleConnection(id);
     }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className="dashboard-title">System Integrations</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '600px', lineHeight: 1.5 }}>
              Data boundaries determine how intelligent your agents can be. 
              Connect external ecosystems and SaaS tools securely to expand your platform capabilities.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ color: 'var(--primary-gradient)' }}>
              <Loader2 size={32} />
            </motion.div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {integrationsMeta.map((integration, index) => {
              const Icon = integration.icon;
              const isConnected = integrations[integration.id];
              return (
                <motion.div 
                  key={integration.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="dashboard-panel"
                  style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div className="agent-icon" style={{ background: isConnected ? 'rgba(5, 150, 105, 0.1)' : 'rgba(15, 23, 42, 0.05)', color: isConnected ? 'var(--success)' : 'var(--text-primary)' }}>
                      <Icon size={24} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: '100px', background: isConnected ? 'rgba(5, 150, 105, 0.1)' : 'rgba(15, 23, 42, 0.05)', color: isConnected ? 'var(--success)' : 'var(--text-muted)' }}>
                      {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{integration.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1 }}>{integration.desc}</p>
                  
                  {isConnected && (
                     <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--success)' }}>
                        <CheckCircle2 size={12} /> Environment context is mapped and active.
                     </div>
                  )}

                  <Button 
                    variant={isConnected ? 'outline' : 'primary'} 
                    style={{ width: '100%' }}
                    onClick={() => onToggleClick(integration.id)}
                  >
                    <LinkIcon size={14} style={{ marginRight: '0.5rem' }} />
                    {isConnected ? 'Revoke Access' : 'Authenticate Tool'}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalType && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalType(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="dashboard-panel"
              style={{ width: '100%', maxWidth: '450px', position: 'relative', zIndex: 1001, padding: '2rem' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                 <div className="agent-icon" style={{ background: 'var(--primary-gradient)', width: '60px', height: '60px', margin: '0 auto 1.5rem' }}>
                    {modalType === 'github' ? <GitBranch size={30} color="white" /> : <Mail size={30} color="white" />}
                 </div>
                 <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Link {modalType === 'github' ? 'GitHub' : 'Google'} Account</h2>
                 <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Provide an access credential to map your environment to autonomous Nexus agents.</p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                 <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Access Token</label>
                 <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                       <Key size={16} />
                    </div>
                    <input 
                       type="password" 
                       className="form-input" 
                       style={{ paddingLeft: '3rem' }} 
                       placeholder={`ya29.xxxx / ghp_xxxx`} 
                       value={tokenInput}
                       onChange={(e) => setTokenInput(e.target.value)}
                    />
                 </div>
              </div>

              <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                 <AlertCircle size={20} color="#3b82f6" style={{ flexShrink: 0 }} />
                 <p style={{ fontSize: '0.75rem', color: '#3b82f6', margin: 0 }}>The credential will be physically verified against {modalType === 'github' ? 'GitHub' : 'Google Cloud'} API clusters before mapping.</p>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                 <Button variant="primary" style={{ flex: 1 }} onClick={handleLink} disabled={linkLoading}>
                    {linkLoading ? <Loader2 size={16} className="animate-spin" /> : 'Map Platform Context'}
                 </Button>
                 <Button variant="ghost" onClick={() => setModalType(null)}>Cancel</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
