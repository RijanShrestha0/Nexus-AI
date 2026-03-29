import React from 'react';
import { NavLink } from 'react-router-dom';
import { Hexagon, LayoutDashboard, Database, Settings, Users, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export function Sidebar() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="dashboard-sidebar">
      <div className="brand" style={{ padding: '0 0.5rem', marginBottom: '1rem' }}>
        <div className="brand-icon-wrapper">
          <Hexagon className="brand-icon" size={24} />
        </div>
        <span>Nexus</span>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} /> Overview
        </NavLink>
        <NavLink 
          to="/agents" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Users size={18} /> Agents
        </NavLink>
        <NavLink 
          to="/integrations" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Database size={18} /> Integrations
        </NavLink>
        <NavLink 
          to="/settings" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Settings size={18} /> Settings
        </NavLink>
      </nav>
      
      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button className="sidebar-link" onClick={toggleTheme} style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {theme === 'dark' ? <><Sun size={18} /> Light Mode</> : <><Moon size={18} /> Dark Mode</>}
        </button>
        <button className="sidebar-link" onClick={logout} style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );
}
