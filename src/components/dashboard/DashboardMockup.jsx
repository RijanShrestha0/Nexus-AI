import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Database, Settings } from 'lucide-react';
import { useDashboardSimulation } from '../../hooks/useDashboardSimulation';
import { StatCard } from './StatCard';
import { ActivityFeed } from './ActivityFeed';

export function DashboardMockup() {
  const { tasks } = useDashboardSimulation();

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50, rotateY: -15, rotateX: 10, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, rotateY: -5, rotateX: 5, scale: 1 }}
      transition={{ type: "spring", stiffness: 40, damping: 20, delay: 0.7 }}
      whileHover={{ rotateY: 0, rotateX: 0, scale: 1.02 }}
      className="hero-visual"
      style={{ perspective: "1000px" }}
    >
      <div className="dashboard-mockup glass-panel" style={{ transform: 'none' }}>
        <div className="mockup-header">
          <div className="window-controls">
            <span />
            <span />
            <span />
          </div>
          <div className="mockup-tabs">
            <div className="tab active">Agent Activity</div>
            <div className="tab">Workflows</div>
          </div>
        </div>
        <div className="mockup-body">
          <div className="sidebar">
            <div className="sidebar-item active"><Activity size={20} /></div>
            <div className="sidebar-item"><Database size={20} /></div>
            <div className="sidebar-item"><Settings size={20} /></div>
          </div>
          <div className="main-view">
            <div className="stats-row">
              <StatCard 
                label="Tasks Executed" 
                value={tasks} 
                trend="14%" 
                isAnimatedValue 
              />
              <StatCard 
                label="Time Saved" 
                value="1,400h" 
                trend="8%" 
              />
            </div>
            <ActivityFeed />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
