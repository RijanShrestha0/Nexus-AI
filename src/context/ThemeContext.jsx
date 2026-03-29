import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Check if user has explicitly saved a preference, otherwise default elegantly to 'light'
  const [theme, setTheme] = useState(() => localStorage.getItem('nexus_theme') || 'light');

  // Any state change dynamically rewrites the top-level HTML root class securely
  useEffect(() => {
    localStorage.setItem('nexus_theme', theme);
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
