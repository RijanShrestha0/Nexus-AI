import React from 'react';
import { motion } from 'framer-motion';

export function AmbientBackground() {
  return (
    <div className="ambient-background">
      <motion.div 
        animate={{ scale: [1, 1.1, 1], x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        className="glow glow-1"
      />
      <motion.div 
        animate={{ scale: [1.1, 1, 1.1], x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 25, repeat: Infinity, repeatType: "reverse" }}
        className="glow glow-2"
      />
    </div>
  );
}
