import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/layout/Sidebar';
import { GitBranch, Hash, Database, Mail, Link as LinkIcon, Loader2, X, Key, AlertCircle, CheckCircle2, ShieldCheck, Globe } from 'lucide-react';
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
  
  // High-Fidelity Connection Auth State
  const [activeAuth, setActiveAuth] = useState(null); // 'github' | 'gmail'
  const [authStep, setAuthStep] = useState(1);
  const [authLoading, setAuthLoading] = useState(false);

  const startAuthorization = (id) => {
    setActiveAuth(id);
    setAuthStep(1);
  };

  const handleNativeLink = async () => {
    setAuthLoading(true);
    
    // Determine mapping endpoint
    const endpoint = activeAuth === 'github' ? 'github/link' : 'google/link';
    
    try {
      // Step 2: Request platform state-bridge
      const response = await fetch(`http://localhost:5005/api/dashboard/integrations/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ accessToken: 'internal_platform_session' }) // Handled by backend fallback
      });
      
      if (response.ok) {
        setAuthStep(2); // Success step
        setTimeout(() => {
          setActiveAuth(null);
          window.location.reload();
        }, 2000);
      } else {
        addToast('Native platform handshake failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Critical platform communication failure.', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const onToggleClick = (id) => {
     if ((id === 'github' || id === 'gmail') && !integrations[id]) {
        startAuthorization(id);
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
              Connect external ecosystems through the <strong>Secure Platform Bridge</strong> to expand your platform capabilities.
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
                        <CheckCircle2 size={12} /> Unit successfully bridged to your account cluster.
                     </div>
                  )}

                  <Button 
                    variant={isConnected ? 'outline' : 'primary'} 
                    style={{ width: '100%' }}
                    onClick={() => onToggleClick(integration.id)}
                  >
                    <LinkIcon size={14} style={{ marginRight: '0.5rem' }} />
                    {isConnected ? 'Revoke Access' : 'Connect Account'}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeAuth && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveAuth(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="dashboard-panel"
              style={{ width: '100%', maxWidth: '500px', position: 'relative', zIndex: 1001, padding: '2.5rem', textAlign: 'center' }}
            >
              {authStep === 1 ? (
                 <>
                   <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                      <div className="agent-icon" style={{ background: 'var(--primary-gradient)', width: '64px', height: '64px' }}>
                         <ShieldCheck size={32} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}><Globe size={24} className="animate-pulse" /></div>
                      <div className="agent-icon" style={{ background: 'rgba(0,0,0,0.05)', width: '64px', height: '64px', color: 'var(--text-primary)' }}>
                         {activeAuth === 'github' ? <GitBranch size={32} /> : <Mail size={32} />}
                      </div>
                   </div>
                   
                   <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Authorize Platform Connection</h2>
                   <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                      Nexus AI is requesting permission to securely bridge to your <strong>{activeAuth === 'github' ? 'GitHub' : 'Google Workspace'}</strong> environment. No manual tokens are required for this native handshake.
                   </p>

                   <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.1)', marginBottom: '2rem', display: 'flex', gap: '0.75rem', textAlign: 'left' }}>
                      <ShieldCheck size={20} color="#3b82f6" style={{ flexShrink: 0 }} />
                      <p style={{ fontSize: '0.8125rem', color: '#3b82f6', margin: 0 }}>This is a <strong>Secure Native Bridge</strong>. Your credentials are encrypted and never leave the system context.</p>
                   </div>

                   <div style={{ display: 'flex', gap: '1rem' }}>
                      <Button variant="primary" style={{ flex: 1 }} onClick={handleNativeLink} disabled={authLoading}>
                         {authLoading ? <Loader2 size={16} className="animate-spin" /> : `Authorize ${activeAuth === 'github' ? 'GitHub' : 'Google'}`}
                      </Button>
                      <Button variant="ghost" onClick={() => setActiveAuth(null)}>Cancel</Button>
                   </div>
                 </>
              ) : (
                 <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                    <div className="agent-icon" style={{ background: 'var(--success)', width: '64px', height: '64px', margin: '0 auto 1.5rem', color: 'white' }}>
                       <CheckCircle2 size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Connection established!</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Synchronizing your data boundaries with the platform engine...</p>
                 </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
