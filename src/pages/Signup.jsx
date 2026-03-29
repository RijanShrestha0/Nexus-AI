import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hexagon, ArrowRight } from 'lucide-react';
import { AmbientBackground } from '../components/ui/AmbientBackground';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Signup() {
  const { signup } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password && firstName) {
      signup(email, password, firstName, lastName);
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
            <h2>Create an account</h2>
            <p>Start deploying your autonomous agents today.</p>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input 
                  type="text" 
                  placeholder="John" 
                  className="form-input" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input 
                  type="text" 
                  placeholder="Doe" 
                  className="form-input" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
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
                placeholder="Create a password" 
                className="form-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button variant="primary" className="auth-submit" onClick={handleSubmit}>
              Start Free Trial
            </Button>
          </form>
          
          <div className="auth-footer">
            <p>Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
