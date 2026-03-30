import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/layout/Sidebar';
import { Bot, Plus, Search, Database, X, Terminal, Settings as SettingsIcon, Loader2, GitBranch, AlertCircle, Play, Square } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAgents } from '../hooks/useAgents';
import { useAuth } from '../context/AuthContext';

const agentTypes = [
  { id: 'github-monitor', name: 'Repo Sentinel', desc: 'Monitors commit activity and synchronizes platform telemetry.', icon: GitBranch },
  { id: 'issue-creator', name: 'Issue Architect', desc: 'Identifies environment gaps and autonomously creates GitHub issues.', icon: Terminal },
  { id: 'repo-creator', name: 'Cloud Provisioner', desc: 'Instantly bootstraps repositories and project infrastructure.', icon: Plus }
];

// Helper to safely render icons across different browser engines
const AgentIcon = ({ type, size = 20, style = {} }) => {
  const typeMatch = agentTypes.find(t => t.id === type);
  const IconComponent = typeMatch?.icon || Bot;
  return <IconComponent size={size} style={style} />;
};

export function Agents() {
  const { token } = useAuth();
  const { agents, loading, createAgent, deleteAgent, getAgentDetails, fetchAgents } = useAgents(token);
  const [showForm, setShowForm] = useState(false);
  const [repoList, setRepoList] = useState([]);
  const [reposLoading, setReposLoading] = useState(false);
  
  // New Agent State
  const [agentName, setAgentName] = useState('');
  const [agentType, setAgentType] = useState('github-monitor');
  const [config, setConfig] = useState({ repo: '', issueTitle: '', issueBody: '', repoName: '', repoDesc: '' });

  // UI Detail State
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [pollingLogs, setPollingLogs] = useState(false);

  useEffect(() => {
    if (showForm && token) {
      setReposLoading(true);
      fetch('http://localhost:5005/api/dashboard/integrations/github/repos', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.repos) setRepoList(data.repos);
      })
      .finally(() => setReposLoading(false));
    }
  }, [showForm, token]);

  const handleDeploy = async () => {
    if (!agentName) return;
    await createAgent(agentName, agentType, config);
    setShowForm(false);
    setAgentName('');
    setConfig({ repo: '', issueTitle: '', issueBody: '', repoName: '', repoDesc: '' });
  };

  const openAgentDetails = async (agent) => {
    setSelectedAgent(agent);
    setPollingLogs(true);
    const details = await getAgentDetails(agent.id);
    setModalData(details);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 className="dashboard-title">Autonomous Workforce</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Deploy and manage your distributed engineering nodes.</p>
          </div>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            <Plus size={18} style={{ marginRight: '0.5rem' }} />
            Deploy New Agent
          </Button>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: 'var(--primary-gradient)' }} />
          </div>
        ) : (
          <div className="agent-grid">
            {agents.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '4rem' }}>
                <Bot size={48} />
                <h3>No Workforce Deployed</h3>
                <p>Establishing digital engineering boundaries requires your first autonomous unit.</p>
                <Button variant="ghost" onClick={() => setShowForm(true)} style={{ marginTop: '1rem' }}>Deploy Unit 01</Button>
              </div>
            ) : (
              <AnimatePresence>
                {agents.map((agent) => (
                  <motion.div 
                    key={agent.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="dashboard-panel agent-card"
                    onClick={() => openAgentDetails(agent)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="agent-card-header">
                      <div className="agent-icon">
                        <AgentIcon type={agent.type} size={24} />
                      </div>
                      <div className="agent-status-badge" style={{ background: agent.status === 'Active' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(255, 255, 255, 0.05)', color: agent.status === 'Active' ? 'var(--success)' : 'var(--text-muted)' }}>
                        <span className={`status-dot ${(agent.status || '').toLowerCase()}`} />
                        {agent.status || 'Wait...'}
                      </div>
                    </div>
                    <div className="agent-card-body">
                      <h3>{agent.name}</h3>
                      <p className="agent-type-label">{agentTypes.find(t => t.id === agent.type)?.name || agent.type}</p>
                      <div className="agent-config-summary">
                        <GitBranch size={12} /> {agent.config.repo || agent.config.repoName || 'Handshaking...'}
                      </div>
                    </div>
                    <div className="agent-card-footer">
                       <Button variant="ghost" size="small" onClick={(e) => { e.stopPropagation(); deleteAgent(agent.id); }} style={{ color: 'var(--error)' }}>
                         Terminate
                       </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="dashboard-panel form-modal" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.25rem' }}>Platform Unit Deployment</h2>
                  <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
               </div>

               <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Agent Name</label>
                  <input className="form-input" placeholder="e.g. Sentinel-7" value={agentName} onChange={(e) => setAgentName(e.target.value)} />
               </div>

               <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Specialization</label>
                  <div className="type-selector" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    {agentTypes.map(t => (
                        <div 
                          key={t.id}
                          className={`type-option ${agentType === t.id ? 'active' : ''}`}
                          onClick={() => setAgentType(t.id)}
                          style={{ border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', background: agentType === t.id ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.05)', color: agentType === t.id ? 'white' : 'var(--text-primary)' }}
                        >
                           <AgentIcon type={t.id} size={20} style={{ margin: '0 auto 0.5rem' }} />
                           <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{t.name}</span>
                        </div>
                    ))}
                  </div>
               </div>

               <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label">Environment Boundary (Repository)</label>
                  
                  {agentType === 'repo-creator' ? (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input className="form-input" placeholder="Initial Repository Name" value={config.repoName} onChange={(e) => setConfig({ ...config, repoName: e.target.value })} />
                        <textarea className="form-input" placeholder="Blueprint Description" style={{ height: '80px', padding: '0.75rem' }} value={config.repoDesc} onChange={(e) => setConfig({ ...config, repoDesc: e.target.value })} />
                     </div>
                  ) : (
                    <div style={{ position: 'relative' }}>
                       {reposLoading ? (
                          <div style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Retrieving from GitHub...</div>
                       ) : (
                          <select className="form-input" style={{ appearance: 'none' }} value={config.repo} onChange={(e) => setConfig({ ...config, repo: e.target.value })}>
                            <option value="">Select Target Repository</option>
                            {repoList.map(r => (
                               <option key={r.id || r.name || r} value={r.name || r}>
                                  {r.name || r}
                               </option>
                            ))}
                          </select>
                       )}
                    </div>
                  )}
               </div>

               <Button variant="primary" style={{ width: '100%' }} onClick={handleDeploy} disabled={!agentName}>
                  Establish Node Connection
               </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedAgent && (
           <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="dashboard-panel detail-modal" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                 <div className="detail-modal-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                       <div className="agent-icon" style={{ width: '40px', height: '40px' }}>
                          <AgentIcon type={selectedAgent.type} size={20} />
                       </div>
                       <div>
                          <h2 style={{ fontSize: '1.125rem' }}>{selectedAgent.name}</h2>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {selectedAgent.id}</p>
                       </div>
                    </div>
                    <button onClick={() => setSelectedAgent(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
                 </div>

                 <div className="detail-modal-content" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', flex: 1, overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', overflowY: 'auto', background: 'rgba(0,0,0,0.2)' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Telemetry & Activity Log</h3>
                          <span style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                             <span className="status-pulse" /> Live Execution Stream
                          </span>
                       </div>
                       <div className="log-stream" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {modalData?.logs?.length > 0 ? modalData.logs.map((l, i) => (
                            <div key={i} className="log-entry" style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', borderLeft: `2px solid ${l.level === 'SUCCESS' ? 'var(--success)' : 'var(--primary)'}` }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                                  <span style={{ color: 'var(--text-muted)' }}>{new Date(l.timestamp).toLocaleTimeString()}</span>
                                  <span style={{ fontWeight: 600, color: l.level === 'SUCCESS' ? 'var(--success)' : 'var(--text-primary)' }}>{l.level || 'INFO'}</span>
                               </div>
                               <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: 1.4 }}>{l.message}</p>
                            </div>
                          )) : <p>Retrieving heartbeat metrics...</p>}
                       </div>
                    </div>
                    
                    <div style={{ padding: '1.5rem', borderLeft: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                       <div>
                          <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Configuration</h4>
                          <div className="config-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                             <div className="config-item">
                                <label style={{ display: 'block', fontSize: '0.625rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>TARGET REPOSITORY</label>
                                <div style={{ fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                   <GitBranch size={14} /> {selectedAgent.config.repo || selectedAgent.config.repoName}
                                </div>
                             </div>
                             <div className="config-item">
                                <label style={{ display: 'block', fontSize: '0.625rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>LAST ACTION</label>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                   {selectedAgent.lastSeenCommit ? 'Activity Detected' : 'Initializing Handshake'}
                                </div>
                             </div>
                          </div>
                       </div>

                       <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <Button variant={selectedAgent.status === 'Active' ? 'outline' : 'primary'} style={{ width: '100%' }}>
                             {selectedAgent.status === 'Active' ? <Square size={14} style={{ marginRight: '0.5rem' }} /> : <Play size={14} style={{ marginRight: '0.5rem' }} />}
                             {selectedAgent.status === 'Active' ? 'Deactivate Node' : 'Activate Node'}
                          </Button>
                          <Button variant="ghost" style={{ width: '100%', color: 'var(--error)' }} onClick={() => { deleteAgent(selectedAgent.id); setSelectedAgent(null); }}>
                             Terminate Execution
                          </Button>
                       </div>
                    </div>
                 </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
}
