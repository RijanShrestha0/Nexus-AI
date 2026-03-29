import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/layout/Sidebar';
import { Bot, Plus, Search, Database, X, Terminal, Settings as SettingsIcon, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useAgents } from '../hooks/useAgents';

const skeletonPulse = {
  initial: { opacity: 0.4 },
  animate: { opacity: 0.8, transition: { repeat: Infinity, duration: 1.5, repeatType: "reverse" } }
};

export function Agents() {
  const { token } = useAuth();
  const { agents, loading, createAgent, deleteAgent, getAgentDetails } = useAgents(token);
  
  const [newAgentName, setNewAgentName] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  // Modal State
  const [activeModal, setActiveModal] = useState(null); // { type: 'logs' | 'config', agent: {} }
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const handleAddAgent = async (e) => {
    e.preventDefault();
    if (!newAgentName) return;
    await createAgent(newAgentName);
    setNewAgentName('');
    setShowForm(false);
  };

  const openModal = async (type, agent) => {
    setActiveModal({ type, agent });
    setModalLoading(true);
    const data = await getAgentDetails(agent.id);
    setModalData(data);
    setModalLoading(false);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
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

          <div className="agents-grid-stack">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="agent-item" style={{ border: 'none' }}>
                  <motion.div {...skeletonPulse} style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0,0,0,0.05)' }} />
                  <div style={{ flex: 1 }}>
                    <motion.div {...skeletonPulse} style={{ width: '120px', height: '14px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', marginBottom: '6px' }} />
                    <motion.div {...skeletonPulse} style={{ width: '60px', height: '10px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px' }} />
                  </div>
                </div>
              ))
            ) : (
              <AnimatePresence>
                {agents.map((agent) => (
                  <motion.div 
                    key={agent.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
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
                      <Button variant="outline" size="sm" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={() => openModal('logs', agent)}>View Logs</Button>
                      <Button variant="outline" size="sm" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={() => openModal('config', agent)}>Configure</Button>
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

      {/* Detail Modals Code (Rest unchanged) */}
      <AnimatePresence>
        {activeModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="dashboard-panel"
              style={{ width: '100%', maxWidth: '600px', position: 'relative', zIndex: 1001, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="agent-icon" style={{ width: '32px', height: '32px' }}>
                    {activeModal.type === 'logs' ? <Terminal size={16} /> : <SettingsIcon size={16} />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', margin: 0 }}>{activeModal.type === 'logs' ? 'System Console' : 'Unit Configuration'}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{activeModal.agent.name}</p>
                  </div>
                </div>
                <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                {modalLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Loader2 size={24} color="var(--primary-gradient)" /></motion.div>
                  </div>
                ) : modalData ? (
                  activeModal.type === 'logs' ? (
                    <div style={{ background: 'rgba(0,0,0,0.05)', borderRadius: 'var(--radius-md)', padding: '1rem', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                      {modalData.logs.map((log, i) => (
                        <div key={i} style={{ marginBottom: '0.5rem', display: 'flex', gap: '1rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                          <span style={{ color: log.level === 'SUCCESS' ? 'var(--success)' : log.level === 'ERROR' ? 'var(--error)' : 'inherit' }}>{log.message}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <pre style={{ background: 'rgba(0,0,0,0.05)', borderRadius: 'var(--radius-md)', padding: '1rem', fontSize: '0.8125rem', overflowX: 'auto' }}>
                        {JSON.stringify(modalData.config, null, 2)}
                      </pre>
                    </div>
                  )
                ) : <p>Unable to retrieve unit telemetry.</p>}
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="primary" onClick={closeModal}>Close Diagnostic</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
