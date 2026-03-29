import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hexagon, ArrowRight } from 'lucide-react';
import { AmbientBackground } from '../components/ui/AmbientBackground';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      login(email, password);
    }
  };

  return (
    <>
      <AmbientBackground />
      <div className="auth-container">
        <Link to="/" className="auth-back-button">
          <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
          Back to Home
        </Link>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
          className="auth-box glass-panel"
        >
          <div className="auth-header">
            <div className="brand-icon-wrapper auth-icon">
              <Hexagon size={32} />
            </div>
            <h2>Welcome back</h2>
            <p>Enter your details to access your dashboard.</p>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email address</label>
              <input 
                type="email" 
                placeholder="name@company.com" 
                className="form-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="form-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>
            {/* The Button components triggers submit because we pass onClick or use a native button prop. */}
            {/* We convert it to a normal submit button by passing type="submit" and triggering onSubmit in form. */}
            <Button variant="primary" className="auth-submit" onClick={handleSubmit}>
              Sign In
            </Button>
          </form>
          
          <div className="auth-footer">
            <p>Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link></p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
