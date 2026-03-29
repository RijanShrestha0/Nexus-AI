import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { AmbientBackground } from '../components/ui/AmbientBackground';
import { Button } from '../components/ui/Button';

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

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for individuals and small projects exploring Agentic AI.",
    features: [
      "1 Autonomous Agent",
      "1,000 tasks per month",
      "Standard execution speed",
      "Community support",
      "Basic observability logs"
    ],
    cta: "Start Free",
    popular: false
  },
  {
    name: "Professional",
    price: "$49",
    period: "/mo",
    description: "For engineering teams automating complex production workflows.",
    features: [
      "10 Autonomous Agents",
      "50,000 tasks per month",
      "Priority sub-millisecond execution",
      "24/7 Email & Slack support",
      "Deep reasoning trace logs",
      "Custom system integrations"
    ],
    cta: "Start 14-Day Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Unlimited power with self-hosted options and dedicated account management.",
    features: [
      "Unlimited Autonomous Agents",
      "Unlimited tasks",
      "Dedicated edge compute instances",
      "1-hour SLA response time",
      "Self-hosted environment options",
      "Custom security compliance (SOC2/HIPAA)",
      "Dedicated Solutions Architect"
    ],
    cta: "Contact Sales",
    popular: false
  }
];

export function PricingPage() {
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
              <motion.h1 variants={fadeInUp} className="hero-title" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
                Simple, transparent <span className="text-gradient">pricing</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="section-subtitle">
                Scale your AI workforce seamlessly. No hidden fees, no surprise limits.
              </motion.p>
            </motion.div>

            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="pricing-grid"
            >
              {pricingPlans.map((plan, index) => (
                <motion.div 
                  key={plan.name}
                  variants={fadeInUp}
                  whileHover={{ y: -8, boxShadow: "0 10px 40px rgba(15, 23, 42, 0.08)" }}
                  className={`pricing-card glass-panel ${plan.popular ? 'popular' : ''}`}
                >
                  {plan.popular && (
                    <div className="popular-badge">Most Popular</div>
                  )}
                  <h3 className="plan-name">{plan.name}</h3>
                  <p className="plan-desc">{plan.description}</p>
                  <div className="plan-price">
                    <span className="price-value">{plan.price}</span>
                    {plan.period && <span className="price-period">{plan.period}</span>}
                  </div>
                  
                  <Button 
                    variant={plan.popular ? 'primary' : 'outline'} 
                    className="pricing-cta"
                    to={plan.name === "Enterprise" ? "#" : "/signup"}
                  >
                    {plan.cta}
                  </Button>
                  
                  <div className="plan-features">
                    <h4>What's included:</h4>
                    <ul>
                      {plan.features.map((feature, i) => (
                        <li key={i}>
                          <CheckCircle2 size={16} className="feature-icon" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
