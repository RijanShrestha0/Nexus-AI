import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '../components/layout/Sidebar';
import { GitBranch, Hash, Database, Mail, Link as LinkIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';

const integrationsList = [
  { id: 'slack', name: 'Slack', desc: 'Allow agents to send alerts and communicate in channels.', icon: Hash, connected: true },
  { id: 'github', name: 'GitHub', desc: 'Securely map your codebase context to your engineering agents.', icon: GitBranch, connected: true },
  { id: 'postgres', name: 'PostgreSQL', desc: 'Connect internal databases for autonomous SQL queries.', icon: Database, connected: false },
  { id: 'gmail', name: 'Google Workspace', desc: 'Enable agents to draft, read, and categorize your support emails.', icon: Mail, connected: false }
];

export function Integrations() {
  const [connects, setConnects] = useState(integrationsList);

  const toggleConnection = (id) => {
    setConnects(connects.map(i => i.id === id ? { ...i, connected: !i.connected } : i));
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
              Connect external ecosystems and SaaS tools securely using OAuth2 to expand the autonomous capabilities of your platform.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {connects.map((integration, index) => {
            const Icon = integration.icon;
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
                  <div className="agent-icon" style={{ background: integration.connected ? 'rgba(5, 150, 105, 0.1)' : 'rgba(15, 23, 42, 0.05)', color: integration.connected ? 'var(--success)' : 'var(--text-primary)' }}>
                    <Icon size={24} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: '100px', background: integration.connected ? 'rgba(5, 150, 105, 0.1)' : 'rgba(15, 23, 42, 0.05)', color: integration.connected ? 'var(--success)' : 'var(--text-muted)' }}>
                    {integration.connected ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{integration.name}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1 }}>{integration.desc}</p>
                <Button 
                  variant={integration.connected ? 'outline' : 'primary'} 
                  style={{ width: '100%' }}
                  onClick={() => toggleConnection(integration.id)}
                >
                  <LinkIcon size={14} style={{ marginRight: '0.5rem' }} />
                  {integration.connected ? 'Revoke Access' : 'Authenticate Tool'}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
