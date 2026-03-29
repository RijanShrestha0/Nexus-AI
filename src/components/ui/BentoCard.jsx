import React from 'react';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 70,
      damping: 15,
      mass: 1
    }
  }
};

export function BentoCard({ icon: Icon, title, description, className = '', children, spanCols = false }) {
  return (
    <motion.div 
      variants={fadeInUp}
      whileHover={{ y: -8, boxShadow: "0 10px 40px rgba(15, 23, 42, 0.08)", borderColor: "rgba(15, 23, 42, 0.1)" }}
      className={`bento-card glass-panel interactive ${spanCols ? 'col-span-2' : ''} ${className}`.trim()}
    >
      <div className="card-icon"><Icon size={24} /></div>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </motion.div>
  );
}
