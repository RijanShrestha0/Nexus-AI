import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bot, Network, Server } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/layout/Sidebar';
import { StatCard } from '../components/dashboard/StatCard';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { useDashboardSimulation } from '../hooks/useDashboardSimulation';
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tasks } = useDashboardSimulation();

  useEffect(() => {
    // Basic route protection
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null; // Prevent flicker while redirecting

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
          {/* Top row stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
            <motion.div variants={fadeInUp}>
              <StatCard label="Total Executions" value={tasks} trend="12.5%" isAnimatedValue />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <StatCard label="Active Agents" value={14} trend="3 new" />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <StatCard label="Success Rate" value="99.8%" trend="0.1%" />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <StatCard label="Time Saved" value="1,400h" trend="8%" />
            </motion.div>
          </div>
          
          <div className="dashboard-grid">
            <motion.div variants={fadeInUp} className="dashboard-panel">
              <h2 className="panel-title">Active AI Agents</h2>
              <div className="agents-list">
                <div className="agent-item">
                  <div className="agent-info">
                    <div className="agent-icon"><Bot size={20} /></div>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>Customer Support NLP</p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Running normally</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Manage</Button>
                </div>
                
                <div className="agent-item">
                  <div className="agent-info">
                    <div className="agent-icon"><Database size={20} /></div>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>CRM Sync Pipeline</p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Running normally</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Manage</Button>
                </div>
                
                <div className="agent-item">
                  <div className="agent-info">
                    <div className="agent-icon"><Server size={20} /></div>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>Log Intelligence</p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Idle</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Manage</Button>
                </div>
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
