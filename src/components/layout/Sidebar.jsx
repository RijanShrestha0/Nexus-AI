import React from 'react';
import { NavLink } from 'react-router-dom';
import { Hexagon, LayoutDashboard, Database, Settings, Users, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Sidebar() {
  const { logout } = useAuth();
  
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
      
      <div className="sidebar-footer">
        <button className="sidebar-link" onClick={logout} style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );
}
