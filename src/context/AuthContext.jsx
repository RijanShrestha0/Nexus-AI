import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nexus_token') || null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Verify specific tokens on standard app mount
  useEffect(() => {
    if (token) {
      fetch('http://localhost:5005/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        } else {
          setToken(null);
          localStorage.removeItem('nexus_token');
        }
      })
      .catch(() => {
        console.warn("Backend might not be fully running.");
        setToken(null);
        localStorage.removeItem('nexus_token');
      });
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch('http://localhost:5005/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('nexus_token', data.token);
        navigate('/dashboard');
        return true;
      } else {
        addToast(data.error || 'Invalid credentials.', 'error');
        return false;
      }
    } catch (err) {
      console.error(err);
      addToast('Unable to securely execute connection to backend. Is node actively running?', 'error');
      return false;
    }
  };

  const signup = async (email, password, firstName, lastName) => {
    try {
      const res = await fetch('http://localhost:5005/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password })
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('nexus_token', data.token);
        navigate('/dashboard');
        addToast('Welcome to Nexus Platform!', 'success');
        return true;
      } else {
        addToast(data.error || 'Account creation rejected natively.', 'error');
        return false;
      }
    } catch (err) {
      console.error(err);
      addToast('Unable to natively reach backend server. Did you start API correctly?', 'error');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nexus_token');
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
