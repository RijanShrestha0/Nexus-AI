import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/layout/Sidebar';
import { Bot, Plus, Search, Database } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useAgents } from '../hooks/useAgents';

export function Agents() {
  const { token } = useAuth();
  const { agents, loading, createAgent, deleteAgent } = useAgents(token);
  
  const [newAgentName, setNewAgentName] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleAddAgent = async (e) => {
    e.preventDefault();
    if (!newAgentName) return;
    await createAgent(newAgentName);
    setNewAgentName('');
    setShowForm(false);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className="dashboard-title">Autonomous Agents</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '600px', lineHeight: 1.5 }}>
              Agents are custom AI workers designed to execute specialized tasks autonomously. 
              You can deploy new agents instantly, grant them permissions to your data, and monitor their execution paths.
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} /> Deploy Agent
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="dashboard-panel"
              style={{ marginBottom: '2rem' }}
            >
              <h3>Build New AI Agent</h3>
              <form onSubmit={handleAddAgent} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ flex: 1, maxWidth: '400px' }}
                  placeholder="e.g. Lead Qualification Bot" 
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  autoFocus
                />
                <Button variant="primary" onClick={handleAddAgent}>Initialize Node</Button>
                <Button variant="ghost" onClick={(e) => { e.preventDefault(); setShowForm(false); }}>Cancel</Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="agents-list dashboard-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="panel-title" style={{ margin: 0 }}>Active Workforce</h2>
            <div className="form-input" style={{ width: '250px', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
              <Search size={16} color="var(--text-muted)" />
              <input type="text" placeholder="Search actively running agents..." style={{ background: 'transparent', border: 'none', outline: 'none', color: 'inherit', width: '100%' }} />
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Synchronizing cluster data...</p>
          ) : (
            <AnimatePresence>
              {agents.map((agent) => (
                <motion.div 
                  key={agent.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="agent-item"
                >
                  <div className="agent-info">
                    <div className="agent-icon">
                      {agent.type === 'bot' ? <Bot size={20} /> : <Database size={20} />}
                    </div>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{agent.name}</p>
                      <span style={{ fontSize: '0.75rem', color: agent.status === 'Initializing' ? '#6366f1' : 'var(--success)' }}>
                        {agent.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button variant="outline" size="sm" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>View Logs</Button>
                    <Button variant="outline" size="sm" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Configure</Button>
                    <Button variant="ghost" size="sm" style={{ color: 'var(--error)' }} onClick={() => deleteAgent(agent.id)}>Terminate</Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {!loading && agents.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No active modules detected. Click "Deploy Agent" to spin up instances.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
