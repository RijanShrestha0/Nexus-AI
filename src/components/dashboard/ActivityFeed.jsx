import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';

export function ActivityFeed() {
  return (
    <div className="activity-feed">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="feed-item"
      >
        <div className="feed-icon success"><CheckCircle2 size={14} /></div>
        <div className="feed-content">
          <p><strong>Data Sync Agent</strong> completed customer cross-reference.</p>
          <span>2 mins ago</span>
        </div>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5 }}
        className="feed-item delayed"
      >
        <div className="feed-icon warning">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
            <Loader2 size={14} />
          </motion.div>
        </div>
        <div className="feed-content">
          <p><strong>Support Agent</strong> classifying new tickets.</p>
          <span>In progress...</span>
        </div>
      </motion.div>
    </div>
  );
}
