import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bot, Database, Server, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { useAgents } from '../hooks/useAgents';
import { Sidebar } from '../components/layout/Sidebar';
import { StatCard } from '../components/dashboard/StatCard';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { Button } from '../components/ui/Button';

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const skeletonPulse = {
  initial: { opacity: 0.4 },
  animate: { opacity: 0.8, transition: { repeat: Infinity, duration: 1.5, repeatType: "reverse" } }
};

export function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { metrics, loading: metricsLoading } = useDashboardMetrics(token);
  const { agents, loading: agentsLoading } = useAgents(token);

  useEffect(() => {
    if (!user && !token) {
      navigate('/login');
    }
  }, [user, token, navigate]);

  // If we have NO user and NO token verification yet, show minimal shell or spinner
  if (!user && token) {
     return (
       <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
         <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
           <Loader2 color="var(--primary-gradient)" size={40} />
         </motion.div>
       </div>
     );
  }

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Overview</h1>
          <div className="dashboard-user">
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Logged in as <strong style={{ color: 'var(--text-primary)' }}>{user.name}</strong>
            </span>
          </div>
        </div>
        
        <div className="dashboard-overview">
          {/* Top Stat Row with Skeletons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
            {metrics ? (
              <>
                <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                  <StatCard label="Total Executions" value={metrics.tasksExecuted} trend={metrics.trends.tasks} isAnimatedValue />
                </motion.div>
                <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                  <StatCard label="Active Agents" value={metrics.activeAgents} trend={metrics.trends.agents} />
                </motion.div>
                <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                  <StatCard label="Success Rate" value={metrics.successRate} trend={metrics.trends.success} />
                </motion.div>
                <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
                  <StatCard label="Time Saved" value={metrics.timeSaved} trend={metrics.trends.time} />
                </motion.div>
              </>
            ) : (
                [1,2,3,4].map(i => (
                  <motion.div key={i} {...skeletonPulse} className="dashboard-panel" style={{ height: '120px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }} />
                ))
            )}
          </div>
          
          <div className="dashboard-grid">
            <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.4 }} className="dashboard-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className="panel-title" style={{ margin: 0 }}>Active AI Agents</h2>
                <Button variant="ghost" size="sm" to="/agents" style={{ color: 'var(--primary-gradient)', padding: '0.25rem 0.5rem' }}>
                  <Plus size={16} />
                </Button>
              </div>

              <div className="agents-list">
                {agentsLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="agent-item" style={{ border: 'none' }}>
                      <motion.div {...skeletonPulse} style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0,0,0,0.05)' }} />
                      <div style={{ flex: 1 }}>
                        <motion.div {...skeletonPulse} style={{ width: '120px', height: '14px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', marginBottom: '6px' }} />
                        <motion.div {...skeletonPulse} style={{ width: '60px', height: '10px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px' }} />
                      </div>
                    </div>
                  ))
                ) : agents.length > 0 ? (
                  agents.map((agent) => (
                    <div className="agent-item" key={agent.id}>
                      <div className="agent-info">
                        <div className="agent-icon">
                          {agent.type === 'bot' ? <Bot size={20} /> : <Database size={20} />}
                        </div>
                        <div>
                          <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{agent.name}</p>
                          <span style={{ fontSize: '0.75rem', color: agent.status === 'Initializing' ? 'var(--text-muted)' : 'var(--success)' }}>
                            {agent.status}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" to="/agents" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Manage</Button>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No active agents populated natively yet.</p>
                )}
              </div>
            </motion.div>
            
            <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.5 }} className="dashboard-panel">
              <h2 className="panel-title">Live Activity log</h2>
              <ActivityFeed />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
