import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = (email, password) => {
    // Simulate real auth call
    setUser({ email, name: 'John Doe', role: 'admin' });
    navigate('/dashboard');
  };

  const signup = (email, password, firstName, lastName) => {
    // Simulate user registration
    setUser({ email, name: `${firstName} ${lastName}`, role: 'admin' });
    navigate('/dashboard');
  }

  const logout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
