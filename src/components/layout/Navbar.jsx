import React from 'react';
import { motion } from 'framer-motion';
import { Hexagon, Sun, Moon } from 'lucide-react';
import { useScroll } from '../../hooks/useScroll';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

export function Navbar() {
  const scrolled = useScroll(50);
  const { theme, toggleTheme } = useTheme();

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
        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={toggleTheme} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Button variant="ghost" to="/login">Sign In</Button>
          <Button variant="primary" to="/signup">Start Free Trial</Button>
        </div>
      </div>
    </motion.nav>
  );
}
