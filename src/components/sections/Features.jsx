import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Workflow, BarChart3 } from 'lucide-react';
import { BentoCard } from '../ui/BentoCard';
import { useDashboardSimulation } from '../../hooks/useDashboardSimulation';

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

export function Features() {
  const { bars } = useDashboardSimulation();

  return (
    <section id="features" className="features section-padding">
      <div className="container">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="section-header center"
        >
          <h2 className="section-title">Everything you need to scale</h2>
          <p className="section-subtitle">Our platform provides enterprise-grade infrastructure for your AI workforce, completely managed and secure.</p>
        </motion.div>
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="bento-grid"
        >
          <BentoCard 
            icon={Zap}
            title="Lightning Fast Execution"
            description="Our distributed edge network ensures your agents run close to your data sources for sub-millisecond latency."
            spanCols
          >
            <div className="visual-placeholder pattern-dots" />
          </BentoCard>
          
          <BentoCard 
            icon={Shield}
            title="Enterprise Security"
            description="SOC2 compliant with zero-trust architecture built-in. Your data never leaves your secure boundary."
          />

          <BentoCard 
            icon={Workflow}
            title="Visual Builder"
            description="Drag and drop components to build complex reasoning loops without writing a single line of code."
          />

          <BentoCard 
            icon={BarChart3}
            title="Deep Observability"
            description="Trace every decision your agents make with our comprehensive reasoning logs and execution metrics."
            spanCols
          >
            <div className="visual-placeholder chart-mockup">
              {bars.map((height, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: `${height}%` }}
                  transition={{ type: "spring", stiffness: 30, damping: 10 }}
                  className="bar" 
                />
              ))}
            </div>
          </BentoCard>
        </motion.div>
      </div>
    </section>
  );
}
