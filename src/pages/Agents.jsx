import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/layout/Sidebar';
import { Bot, Plus, Search, Database, X, Terminal, Settings as SettingsIcon, Loader2, GitBranch, AlertCircle, Play, Square } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useAgents } from '../hooks/useAgents';

const skeletonPulse = {
  initial: { opacity: 0.4 },
  animate: { opacity: 0.8, transition: { repeat: Infinity, duration: 1.5, repeatType: "reverse" } }
};

export function Agents() {
  const { token } = useAuth();
  const { agents, loading, createAgent, deleteAgent, getAgentDetails, fetchAgents } = useAgents(token);
  
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  
  // New Agent Form State
  const [agentName, setAgentName] = useState('');
  const [agentType, setAgentType] = useState('github-monitor');
  const [selectedRepo, setSelectedRepo] = useState('');
  const [issueTitle, setIssueTitle] = useState('');
  const [repos, setRepos] = useState([]);
  const [reposLoading, setReposLoading] = useState(false);

  // Modal State
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch Repos when form is opened
  useEffect(() => {
    if (showForm && token) {
      setReposLoading(true);
      fetch('http://localhost:5005/api/dashboard/integrations/github/repos', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.repos) setRepos(data.repos);
      })
      .catch(console.error)
      .finally(() => setReposLoading(false));
    }
  }, [showForm, token]);

  const handleDeploy = async (e) => {
    e.preventDefault();
    if (!agentName || !selectedRepo) return;
    
    setFormLoading(true);
    const config = {
      repo: selectedRepo,
      issueTitle: agentType === 'issue-creator' ? issueTitle : undefined
    };
    
    await createAgent(agentName, agentType, config);
    setFormLoading(false);
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setAgentName('');
    setAgentType('github-monitor');
    setSelectedRepo('');
    setIssueTitle('');
  };

  const toggleAgentStatus = async (agent) => {
     const newStatus = agent.status === 'Active' ? 'Inactive' : 'Active';
     try {
       await fetch(`http://localhost:5005/api/dashboard/agents/${agent.id}/status`, {
         method: 'PATCH',
         headers: { 
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({ status: newStatus })
       });
       fetchAgents();
     } catch (err) {
       console.error(err);
     }
  };

  const openModal = async (type, agent) => {
    setActiveModal({ type, agent });
    setModalLoading(true);
    const data = await getAgentDetails(agent.id);
    setModalData(data);
    setModalLoading(false);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 className="dashboard-title">Autonomous Workforce</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '600px', lineHeight: 1.5 }}>
              Deploy real AI agents that perform autonomous operations across your GitHub ecosystem.
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} /> New Deployment
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="dashboard-panel"
              style={{ marginBottom: '2rem', border: '1px solid var(--primary-gradient)' }}
            >
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bot size={20} color="var(--primary-gradient)" /> Configure Autonomous Unit
              </h3>
              
              <form onSubmit={handleDeploy} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Agent Identity</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Production Monitor" 
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Unit Action Type</label>
                  <select 
                    className="form-input" 
                    value={agentType} 
                    onChange={(e) => setAgentType(e.target.value)}
                    style={{ appearance: 'none' }}
                  >
                    <option value="github-monitor">GitHub Commit Monitor</option>
                    <option value="issue-creator">Automated Issue Creator</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Target Repository</label>
                  {reposLoading ? (
                     <div className="form-input" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Loader2 size={14} className="animate-spin" /> Synchronizing clusters...
                     </div>
                  ) : (
                    <select 
                      className="form-input" 
                      value={selectedRepo} 
                      onChange={(e) => setSelectedRepo(e.target.value)}
                      required
                    >
                      <option value="">Select a repository...</option>
                      {repos.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                    </select>
                  )}
                </div>

                {agentType === 'issue-creator' && (
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Global Issue Template</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. [AUTO] Critical System Check" 
                      value={issueTitle}
                      onChange={(e) => setIssueTitle(e.target.value)}
                    />
                  </div>
                )}

                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                   <Button variant="primary" type="submit" disabled={formLoading}>
                     {formLoading ? <Loader2 size={16} className="animate-spin" /> : 'Launch Autonomous Node'}
                   </Button>
                   <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="agents-list dashboard-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="panel-title" style={{ margin: 0 }}>Active Workforce</h2>
            <div className="form-input" style={{ width: '250px', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
              <Search size={16} color="var(--text-muted)" />
              <input type="text" placeholder="Filter nodes..." style={{ background: 'transparent', border: 'none', outline: 'none', color: 'inherit', width: '100%' }} />
            </div>
          </div>

          <div className="agents-grid-stack">
            {loading && agents.length === 0 ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="agent-item">
                  <motion.div {...skeletonPulse} style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0,0,0,0.05)' }} />
                  <div style={{ flex: 1 }}>
                    <motion.div {...skeletonPulse} style={{ width: '120px', height: '14px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', marginBottom: '6px' }} />
                    <motion.div {...skeletonPulse} style={{ width: '200px', height: '10px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px' }} />
                  </div>
                </div>
              ))
            ) : (
              <AnimatePresence>
                {agents.map((agent) => (
                  <motion.div 
                    key={agent.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="agent-item"
                    style={{ opacity: agent.status === 'Inactive' ? 0.6 : 1 }}
                  >
                    <div className="agent-info">
                      <div className="agent-icon" style={{ background: agent.status === 'Active' ? 'var(--primary-gradient)' : 'rgba(0,0,0,0.1)' }}>
                        {agent.type === 'github-monitor' ? <GitBranch size={20} /> : <AlertCircle size={20} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.125rem' }}>{agent.name}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                           <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                             <Database size={12} /> {agent.config?.repo || 'Global'}
                           </span>
                           <span style={{ color: agent.status === 'Active' ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
                              {agent.status.toUpperCase()}
                           </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button variant="ghost" size="sm" onClick={() => toggleAgentStatus(agent)} title={agent.status === 'Active' ? 'Pause Node' : 'Resume Node'}>
                         {agent.status === 'Active' ? <Square size={16} /> : <Play size={16} />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openModal('logs', agent)}>Telemetry</Button>
                      <Button variant="outline" size="sm" onClick={() => openModal('config', agent)}>Config</Button>
                      <Button variant="ghost" size="sm" style={{ color: 'var(--error)' }} onClick={() => deleteAgent(agent.id)}><X size={16} /></Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {!loading && agents.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-lg)' }}>
                <Bot size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>No autonomous nodes currently deployed in this sector.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModal(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="dashboard-panel"
              style={{ width: '100%', maxWidth: '700px', position: 'relative', zIndex: 1001, maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: '0' }}
            >
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <div className="agent-icon" style={{ background: 'var(--primary-gradient)', width: '40px', height: '40px' }}>
                      {activeModal.type === 'logs' ? <Terminal size={20} /> : <SettingsIcon size={20} />}
                   </div>
                   <div>
                      <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{activeModal.type === 'logs' ? 'Node Telemetry Stream' : 'Unit Architecture'}</h3>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Unit ID: {activeModal.agent.id}</p>
                   </div>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24} /></button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                {modalLoading ? (
                   <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 size={32} className="animate-spin" color="var(--primary-gradient)" /></div>
                ) : (
                  activeModal.type === 'logs' ? (
                    <div style={{ background: '#0a0a0a', color: '#00ff00', padding: '1.5rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.8125rem', border: '1px solid #333', minHeight: '300px' }}>
                       {modalData?.logs?.length > 0 ? modalData.logs.map((l, i) => (
                         <div key={i} style={{ marginBottom: '0.5rem', display: 'flex', gap: '1rem' }}>
                            <span style={{ color: '#666' }}>[{new Date(l.timestamp).toLocaleTimeString()}]</span>
                            <span style={{ color: l.level === 'ERROR' ? '#ff3b30' : l.level === 'SUCCESS' ? '#4cd964' : 'inherit' }}>{l.message}</span>
                         </div>
                       )) : <p>Awaiting node initialization signal...</p>}
                    </div>
                  ) : (
                    <div className="config-grid">
                       <div style={{ background: 'rgba(0,0,0,0.03)', padding: '1.5rem', borderRadius: '12px' }}>
                          <h4 style={{ marginBottom: '1rem' }}>Dynamic Config Mapping</h4>
                          <pre style={{ margin: 0, fontSize: '0.875rem' }}>{JSON.stringify(modalData?.config, null, 2)}</pre>
                       </div>
                    </div>
                  )
                )}
              </div>
              
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end' }}>
                 <Button variant="primary" onClick={() => setActiveModal(null)}>Close Diagnostic</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
