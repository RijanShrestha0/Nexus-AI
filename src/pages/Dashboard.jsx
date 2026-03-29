import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bot, Database, Server } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { useAgents } from '../hooks/useAgents';
import { Sidebar } from '../components/layout/Sidebar';
import { StatCard } from '../components/dashboard/StatCard';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { Button } from '../components/ui/Button';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { metrics, loading: metricsLoading } = useDashboardMetrics(token);
  const { agents, loading: agentsLoading } = useAgents(token);

  useEffect(() => {
    // Basic route protection
    if (!user && !token) {
      navigate('/login');
    }
  }, [user, token, navigate]);

  if ((!user && token) || metricsLoading || agentsLoading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading securely injected application data...</div>;
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
        
        <motion.div 
          className="dashboard-overview"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Top row stats loaded cleanly from native backend JSON database logic */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
            {metrics ? (
              <>
                <motion.div variants={fadeInUp}>
                  <StatCard label="Total Executions" value={metrics.tasksExecuted} trend={metrics.trends.tasks} isAnimatedValue />
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <StatCard label="Active Agents" value={metrics.activeAgents} trend={metrics.trends.agents} />
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <StatCard label="Success Rate" value={metrics.successRate} trend={metrics.trends.success} />
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <StatCard label="Time Saved" value={metrics.timeSaved} trend={metrics.trends.time} />
                </motion.div>
              </>
            ) : (
                <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '2rem' }}>Loading dynamic metrics from Backend API server...</div>
            )}
          </div>
          
          <div className="dashboard-grid">
            <motion.div variants={fadeInUp} className="dashboard-panel">
              <h2 className="panel-title">Active AI Agents</h2>
              <div className="agents-list">
                {agents && agents.length > 0 ? (
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
            
            <motion.div variants={fadeInUp} className="dashboard-panel">
              <h2 className="panel-title">Live Activity log</h2>
              <ActivityFeed />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
