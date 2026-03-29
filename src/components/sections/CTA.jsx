import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 70, damping: 15, mass: 1 }
  }
};

export function CTA() {
  return (
    <section className="cta section-padding">
      <div className="container">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="cta-box glass-panel"
        >
          <div className="glow cta-glow" />
          <h2>Ready to augment your team?</h2>
          <p>Join hundreds of companies shipping faster with Nexus agents.</p>
          <Button variant="primary" size="lg" to="/signup">
            Start Building for Free
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
