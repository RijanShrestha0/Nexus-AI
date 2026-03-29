import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { CTA } from '../components/sections/CTA';
import { AmbientBackground } from '../components/ui/AmbientBackground';

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

const problemsSolutions = [
  {
    problem: "Engineering teams spend 40% of their time on mundane devops and testing tasks.",
    solution: "Nexus Agents integrate directly into your CI/CD pipeline, automatically writing tests, provisioning environments, and monitoring deployments."
  },
  {
    problem: "Customer support is bottlenecked by repetitive technical questions that require engineering input.",
    solution: "Support Agents read your entire codebase and documentation to answer deeply technical customer queries with 99% accuracy."
  },
  {
    problem: "Data scattered across CRM, databases, and analytics tools requires constant manual syncing.",
    solution: "Data Sync Agents continuously observe your unified data layer, transforming and migrating schemas autonomously without human intervention."
  }
];

export function SolutionsPage() {
  return (
    <>
      <AmbientBackground />
      <Navbar />
      
      <main className="pt-32">
        <section className="section-padding">
          <div className="container">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="section-header center"
            >
              <motion.h1 variants={fadeInUp} className="hero-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                Solutions for <span className="text-gradient">Modern Teams</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="section-subtitle">
                Stop wasting human potential on robotic tasks. Discover how Nexus transforms traditional bottlenecks.
              </motion.p>
            </motion.div>

            <div className="solutions-grid">
              {problemsSolutions.map((item, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="solution-row glass-panel"
                >
                  <div className="problem-panel">
                    <div className="status-badge error">
                      <X size={16} /> Before Nexus
                    </div>
                    <p>{item.problem}</p>
                  </div>
                  <div className="solution-panel">
                    <div className="status-badge success">
                      <Check size={16} /> With Nexus
                    </div>
                    <p>{item.solution}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        <CTA />
      </main>

      <Footer />
    </>
  );
}
