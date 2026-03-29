import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export function StatCard({ label, value, trend, isAnimatedValue = false }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      {isAnimatedValue ? (
        <AnimatePresence mode="popLayout">
          <motion.span 
            key={value}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="stat-value"
          >
            {value.toLocaleString()}
          </motion.span>
        </AnimatePresence>
      ) : (
        <span className="stat-value">{value}</span>
      )}
      <span className="stat-trend positive">
        <TrendingUp size={12} /> {trend}
      </span>
    </div>
  );
}
