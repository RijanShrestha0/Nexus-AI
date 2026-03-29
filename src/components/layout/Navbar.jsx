import React from 'react';
import { motion } from 'framer-motion';
import { Hexagon } from 'lucide-react';
import { useScroll } from '../../hooks/useScroll';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

export function Navbar() {
  const scrolled = useScroll(50);

  return (
    <motion.nav 
      initial={{ y: -100, x: "-50%" }}
      animate={{ y: 0, x: "-50%" }}
      transition={{ type: "spring", stiffness: 50, damping: 20 }}
      className="navbar"
    >
      <div className={`container nav-container ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="brand">
          <div className="brand-icon-wrapper">
            <Hexagon className="brand-icon" size={24} />
          </div>
          <span>Nexus</span>
        </Link>
        <div className="nav-links">
          <Link to="/features">Features</Link>
          <Link to="/solutions">Solutions</Link>
          <Link to="/pricing">Pricing</Link>
        </div>
        <div className="nav-actions">
          <Button variant="ghost" to="/login">Sign In</Button>
          <Button variant="primary" to="/signup">Start Free Trial</Button>
        </div>
      </div>
    </motion.nav>
  );
}
