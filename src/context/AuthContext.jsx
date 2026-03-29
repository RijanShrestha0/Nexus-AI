import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nexus_token') || null);
  const navigate = useNavigate();

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
        alert(data.error || 'Login failed.');
        return false;
      }
    } catch (err) {
      console.error(err);
      alert('Unable to securely execute connection to backend. Is node actively running?');
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
        return true;
      } else {
        alert(data.error || 'Signup failed.');
        return false;
      }
    } catch (err) {
      console.error(err);
      alert('Unable to natively reach backend server. Did you start API correctly?');
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
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
