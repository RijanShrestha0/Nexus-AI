import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useActivityFeed } from '../../hooks/useActivityFeed';

export function ActivityFeed() {
  const { token } = useAuth();
  const { activities, loading } = useActivityFeed(token);

  if (loading && activities.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
          <Loader2 size={16} color="var(--text-muted)" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="activity-feed">
      <AnimatePresence>
        {activities.map((activity, index) => (
          <motion.div 
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.1 }}
            className={`feed-item ${activity.status === 'pending' ? 'delayed' : ''}`}
          >
            <div className={`feed-icon ${activity.status === 'success' ? 'success' : activity.status === 'pending' ? 'warning' : 'info'}`}>
              {activity.status === 'pending' ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                  <Loader2 size={14} />
                </motion.div>
              ) : activity.status === 'success' ? (
                <CheckCircle2 size={14} />
              ) : (
                <Info size={14} />
              )}
            </div>
            <div className="feed-content">
              <p><strong>{activity.agentName}</strong> {activity.action}.</p>
              <span>{activity.timestamp}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {activities.length === 0 && !loading && (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
          Platform idling. Start a core deployment loop to generate telemetry.
        </p>
      )}
    </div>
  );
}
