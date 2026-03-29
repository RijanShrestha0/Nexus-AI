import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle, Triangle, CircleDashed, Box, Hexagon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { DashboardMockup } from '../dashboard/DashboardMockup';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 70, damping: 15, mass: 1 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.4 }
  }
};

export function Hero() {
  return (
    <section className="hero">
      <div className="container hero-container">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="hero-content"
        >
          <motion.div variants={fadeInUp} className="badge-wrapper">
            <Badge>Nexus 2.0 is now live</Badge>
          </motion.div>
          <motion.h1 variants={fadeInUp} className="hero-title">
            Automate the impossible with <span className="text-gradient">Agentic AI</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="hero-subtitle">
            Build, deploy, and scale autonomous AI agents that understand your business logic and execute complex workflows without human intervention.
          </motion.p>
          <motion.div variants={fadeInUp} className="hero-cta">
            <Button variant="primary" size="lg" to="/signup">
              Deploy Your First Agent
              <ArrowRight size={18} />
            </Button>
            <Button variant="outline" size="lg" href="#demo">
              <PlayCircle size={18} />
              Watch Demo
            </Button>
          </motion.div>
          <motion.div variants={fadeInUp} className="hero-proof">
            <p>Trusted by forward-thinking teams at</p>
            <div className="logo-cloud">
              <Triangle className="company-logo" />
              <CircleDashed className="company-logo" />
              <Box className="company-logo" />
              <Hexagon className="company-logo" />
            </div>
          </motion.div>
        </motion.div>
        
        <DashboardMockup />
      </div>
    </section>
  );
}
