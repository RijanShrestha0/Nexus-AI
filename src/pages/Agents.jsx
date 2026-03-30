import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/layout/Sidebar';
import { Bot, Plus, Search, Database, X, Terminal, Settings as SettingsIcon, Loader2, GitBranch, AlertCircle, Play, Square, Lock, Globe, FolderOpen, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAgents } from '../hooks/useAgents';
import { useAuth } from '../context/AuthContext';
import { useIntegrations } from '../hooks/useIntegrations';

const agentTypes = [
  { id: 'github-monitor', name: 'Repo Sentinel', desc: 'Monitors a local directory and auto-commits to GitHub every 1h45m.', icon: GitBranch },
  { id: 'issue-creator', name: 'Issue Architect', desc: 'Identifies environment gaps and autonomously creates GitHub issues.', icon: Terminal },
  { id: 'repo-creator', name: 'Cloud Provisioner', desc: 'Instantly bootstraps repositories and project infrastructure.', icon: Plus }
];

// Helper to safely render icons across different browser engines
const AgentIcon = ({ type, size = 20, style = {} }) => {
  const typeMatch = agentTypes.find(t => t.id === type);
  const IconComponent = typeMatch?.icon || Bot;
  return <IconComponent size={size} style={style} />;
};

const NextCommitCountdown = ({ lastCommitTimestamp }) => {
  const [timeLeft, setTimeLeft] = useState('Syncing...');
  
  useEffect(() => {
    const updateTime = () => {
      // If no commit history exists, the agent is standing by for the very first immediate push
      if (!lastCommitTimestamp) {
        setTimeLeft('Immediate (Ready for Changes)');
        return;
      }
      
      const waitTarget = lastCommitTimestamp + (105 * 60 * 1000); // 1h 45m
      const diff = waitTarget - Date.now();
      
      if (diff <= 0) {
        setTimeLeft('Immediate (Ready for Changes)');
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h > 0 ? h + 'h ' : ''}${m}m ${s}s`);
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lastCommitTimestamp]);

  return (
    <div style={{ fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
      <Clock size={14} /> {timeLeft}
    </div>
  );
};

export function Agents() {
  const { token } = useAuth();
  const { agents, loading, createAgent, deleteAgent, getAgentDetails, toggleAgentStatus } = useAgents(token);
  const { integrations, loading: integrationsLoading } = useIntegrations();
  const [showForm, setShowForm] = useState(false);
  const [repoList, setRepoList] = useState([]);
  const [reposLoading, setReposLoading] = useState(false);
  
  // New Agent State
  const [agentName, setAgentName] = useState('');
  const [agentType, setAgentType] = useState('github-monitor');
  const [isPrivate, setIsPrivate] = useState(false);
  const [config, setConfig] = useState({ repo: '', localPath: '', issueTitle: '', issueBody: '', repoName: '', repoDesc: '' });

  // UI Detail State
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [pollingLogs, setPollingLogs] = useState(false);

  // Magic Identity Listener
  useEffect(() => {
     if (agentName.endsWith('!')) {
        setIsPrivate(true);
     } else {
        // Defaults back to Public if '!' is removed or explicitly '.'
        setIsPrivate(false);
     }
  }, [agentName]);

  useEffect(() => {
    if (showForm && token && integrations.github?.connected) {
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
  }, [showForm, token, integrations.github?.connected]);

  const handleDeploy = async () => {
    if (!agentName) return;
    if (!integrations.github?.connected) {
       window.location.href = '/integrations';
       return;
    }
    
    // Physical name hardening: Strip magic identifiers
    let finalName = agentName;
    if (finalName.endsWith('.') || finalName.endsWith('!')) {
       finalName = finalName.slice(0, -1);
    }

    await createAgent(finalName, agentType, { ...config, private: isPrivate });
    setShowForm(false);
    setAgentName('');
    setIsPrivate(false);
    setConfig({ repo: '', localPath: '', issueTitle: '', issueBody: '', repoName: '', repoDesc: '' });
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
          <div className="agent-list-vertical">
            {agents.length === 0 ? (
              <div className="empty-state" style={{ padding: '8rem 4rem', textAlign: 'center', border: '1px dashed var(--glass-border)', borderRadius: '8px' }}>
                <Bot size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>No autonomous units active</h3>
              </div>
            ) : (
              <AnimatePresence>
                {agents.map((agent) => (
                  <motion.div 
                    key={agent.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="agent-row-minimal"
                    onClick={() => openAgentDetails(agent)}
                  >
                    <div className="agent-icon">
                      <AgentIcon type={agent.type} size={16} />
                    </div>
                    
                    <div>
                      <h3>{agent.name}</h3>
                      <p className="agent-type-label">{agentTypes.find(t => t.id === agent.type)?.name || agent.type}</p>
                    </div>

                    <div className="repo-meta" style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                         <GitBranch size={12} /> {agent.config.repo || agent.config.repoName || 'System'}
                       </div>
                       {agent.type === 'github-monitor' && agent.config.localPath && (
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                           <FolderOpen size={10} /> {agent.config.localPath.length > 30 ? '...' + agent.config.localPath.slice(-27) : agent.config.localPath}
                         </div>
                       )}
                    </div>

                    <div>
                      <div className={`agent-status-tag ${agent.status === 'Active' ? 'active' : 'wait'}`}>
                        {agent.status || 'Wait'}
                      </div>
                    </div>

                    <div className="actions-minimal">
                       <Button variant="ghost" style={{ fontSize: '0.65rem', color: 'var(--error)', padding: '0.2rem 0.5rem' }} onClick={(e) => { e.stopPropagation(); deleteAgent(agent.id); }}>
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
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="form-modal" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem', background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Deploy New Agent</h2>
                  <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
               </div>

               <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--label-primary)', margin: 0 }}>Identity (Name)</label>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                       <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Shortcut: . (Pub) / ! (Priv)</span>
                       <div style={{ display: 'flex', background: 'var(--surface-light)', borderRadius: '4px', padding: '2px', border: '1px solid var(--glass-border)' }}>
                          <button onClick={() => setIsPrivate(false)} style={{ border: 'none', background: !isPrivate ? 'var(--text-primary)' : 'transparent', color: !isPrivate ? 'var(--bg-color)' : 'var(--text-muted)', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '2px', cursor: 'pointer', transition: 'all 0.2s' }}>Public</button>
                          <button onClick={() => setIsPrivate(true)} style={{ border: 'none', background: isPrivate ? 'var(--text-primary)' : 'transparent', color: isPrivate ? 'var(--bg-color)' : 'var(--text-muted)', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '2px', cursor: 'pointer', transition: 'all 0.2s' }}>Private</button>
                       </div>
                    </div>
                  </div>
                  <input 
                    className="form-input" 
                    style={{ border: '1px solid var(--glass-border)', background: 'var(--surface-light)', borderRadius: '4px', fontSize: '0.875rem', color: 'var(--text-primary)', width: '100%', padding: '0.75rem' }} 
                    placeholder="e.g. Sentinel-7. or Sentinel-7!" 
                    value={agentName} 
                    onChange={(e) => setAgentName(e.target.value)} 
                  />
               </div>

               <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--label-primary)', marginBottom: '0.75rem', display: 'block' }}>Specialization</label>
                  <div className="type-selector-horizontal" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {agentTypes.map(t => (
                        <div 
                          key={t.id}
                          className="type-option-parent"
                          style={{ position: 'relative', display: 'flex' }}
                          onClick={() => setAgentType(t.id)}
                        >
                           <motion.div 
                             whileHover={{ y: -2 }}
                             style={{ 
                               border: `1px solid ${agentType === t.id ? 'var(--text-primary)' : 'var(--glass-border)'}`, 
                               padding: '0.75rem', 
                               borderRadius: 'var(--radius-md)', 
                               display: 'flex', 
                               flexDirection: 'column',
                               alignItems: 'center', 
                               justifyContent: 'center',
                               textAlign: 'center',
                               gap: '0.4rem', 
                               cursor: 'pointer', 
                               width: '100%',
                               minHeight: '84px',
                               background: agentType === t.id ? 'var(--surface-light)' : 'transparent',
                               transition: 'border 0.2s, background 0.2s',
                               opacity: agentType === t.id ? 1 : 0.8
                             }}
                           >
                              <div className="option-icon" style={{ 
                                width: '32px', height: '32px', borderRadius: '50%', 
                                background: agentType === t.id ? 'var(--text-primary)' : 'var(--surface-light)', 
                                color: agentType === t.id ? 'var(--bg-color)' : 'var(--text-primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>
                                <AgentIcon type={t.id} size={16} />
                              </div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.2' }}>{t.name}</div>
                           </motion.div>

                           {/* Custom Pro Tooltip - CSS Managed Hover */}
                           <div className="spec-tooltip" style={{ 
                             position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', 
                             background: 'var(--text-primary)', color: 'var(--bg-color)', 
                             padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.65rem', 
                             width: 'max-content', maxWidth: '140px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                             pointerEvents: 'none', transition: 'all 0.2s', zIndex: 10, visibility: 'hidden', opacity: 0
                           }}>
                              {t.desc}
                              <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', border: '5px solid transparent', borderTopColor: 'var(--text-primary)' }} />
                           </div>
                        </div>
                    ))}
                  </div>
               </div>

               <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--label-primary)', marginBottom: '0.5rem', display: 'block' }}>Boundary (Configuration)</label>
                  
                  {!integrations.github?.connected ? (
                     <div style={{ padding: '1.5rem', background: 'var(--surface-light)', borderRadius: '12px', border: '1px dashed var(--glass-border)', textAlign: 'center' }}>
                        <GitBranch size={24} style={{ margin: '0 auto 0.75rem', color: 'var(--label-primary)', opacity: 0.5 }} />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Connect your GitHub cluster to enable node configuration.</p>
                        <Button variant="outline" style={{ width: '100%', fontSize: '0.75rem' }} onClick={() => window.location.href = '/integrations'}>
                           Connect GitHub Connection
                        </Button>
                     </div>
                  ) : agentType === 'repo-creator' ? (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.75rem', background: 'var(--surface-light)', borderRadius: '4px', border: '1px solid var(--glass-border)', marginBottom: '0.4rem' }}>
                           {isPrivate ? <Lock size={14} color="#f59e0b" /> : <Globe size={14} color="#10b981" />}
                           <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isPrivate ? '#f59e0b' : '#10b981' }}>{isPrivate ? 'PRIVATE REPOSITORY' : 'PUBLIC REPOSITORY'}</span>
                        </div>
                        <input className="form-input" style={{ border: '1px solid var(--glass-border)', background: 'var(--surface-light)', borderRadius: '4px', fontSize: '0.875rem', color: 'var(--text-primary)', width: '100%', padding: '0.75rem' }} placeholder="Repository Name" value={config.repoName} onChange={(e) => setConfig({ ...config, repoName: e.target.value })} />
                        <textarea className="form-input" style={{ border: '1px solid var(--glass-border)', background: 'var(--surface-light)', borderRadius: '4px', fontSize: '0.875rem', color: 'var(--text-primary)', width: '100%', height: '80px', padding: '0.75rem' }} placeholder="Blueprint Description" value={config.repoDesc} onChange={(e) => setConfig({ ...config, repoDesc: e.target.value })} />
                     </div>
                  ) : agentType === 'github-monitor' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                       <div>
                         <label style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>Target Repository</label>
                         {reposLoading ? (
                            <div style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Retrieving Platform Cluster...</div>
                         ) : (
                            <div style={{ position: 'relative' }}>
                              <select className="form-input" style={{ appearance: 'none', border: '1px solid var(--glass-border)', background: 'var(--surface-light)', borderRadius: '4px', fontSize: '0.875rem', color: 'var(--text-primary)', width: '100%', cursor: 'pointer', padding: '0.75rem' }} value={config.repo} onChange={(e) => setConfig({ ...config, repo: e.target.value })}>
                                <option value="">Select Target Repository</option>
                                {repoList.map(r => (
                                   <option key={r.id || r.name || r} value={r.name || r}>
                                      {r.name || r}
                                   </option>
                                ))}
                              </select>
                              <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5, color: 'var(--text-primary)' }}>
                                 <Search size={14} />
                              </div>
                            </div>
                         )}
                       </div>
                       <div>
                         <label style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>Local Directory (File Path)</label>
                         <div style={{ position: 'relative' }}>
                           <input
                             className="form-input"
                             style={{ border: '1px solid var(--glass-border)', background: 'var(--surface-light)', borderRadius: '4px', fontSize: '0.875rem', color: 'var(--text-primary)', width: '100%', padding: '0.75rem', paddingLeft: '2.25rem' }}
                             placeholder="/Users/you/Projects/my-app"
                             value={config.localPath}
                             onChange={(e) => setConfig({ ...config, localPath: e.target.value })}
                           />
                           <FolderOpen size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                         </div>
                         <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.5 }}>
                           The Sentinel will watch this directory for changes and auto-commit to the target repo every <strong>1h 45min</strong>.
                         </p>
                       </div>
                    </div>
                  ) : (
                    <div style={{ position: 'relative' }}>
                       {reposLoading ? (
                          <div style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Retrieving Platform Cluster...</div>
                       ) : (
                          <div style={{ position: 'relative' }}>
                            <select className="form-input" style={{ appearance: 'none', border: '1px solid var(--glass-border)', background: 'var(--surface-light)', borderRadius: '4px', fontSize: '0.875rem', color: 'var(--text-primary)', width: '100%', cursor: 'pointer', padding: '0.75rem' }} value={config.repo} onChange={(e) => setConfig({ ...config, repo: e.target.value })}>
                              <option value="">Select Target Repository</option>
                              {repoList.map(r => (
                                 <option key={r.id || r.name || r} value={r.name || r}>
                                    {r.name || r}
                                 </option>
                              ))}
                            </select>
                            <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5, color: 'var(--text-primary)' }}>
                               <Search size={14} />
                            </div>
                          </div>
                       )}
                    </div>
                  )}
               </div>

               <Button variant="primary" style={{ width: '100%', borderRadius: '6px', padding: '0.75rem' }} onClick={handleDeploy} disabled={!agentName || (!integrations.github?.connected && agentType !== 'repo-creator')}>
                  {integrations.github?.connected ? 'Establish Node Connection' : 'Check Cluster Status'}
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
                             {selectedAgent.type === 'github-monitor' && (
                               <div className="config-item">
                                 <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.625rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>NEXT COMMIT WINDOW</label>
                                 <NextCommitCountdown lastCommitTimestamp={modalData?.lastCommitTimestamp} />
                               </div>
                             )}
                          </div>
                       </div>

                       <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <Button 
                             variant={selectedAgent.status === 'Active' ? 'outline' : 'primary'} 
                             style={{ width: '100%' }}
                             onClick={async () => {
                                const nextStatus = selectedAgent.status === 'Active' ? 'Inactive' : 'Active';
                                const success = await toggleAgentStatus(selectedAgent.id, nextStatus);
                                if (success) {
                                   setSelectedAgent(prev => ({ ...prev, status: nextStatus }));
                                }
                             }}
                          >
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
