import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();

  const themeLabel = theme === 'dark' ? '☀️ Light' : '🌙 Dark';

  const navItems = [
    { to: '/dashboard',     icon: '📊', label: 'Dashboard' },
    { to: '/cars',          icon: '🛻', label: 'My Vehicles' },
    { to: '/garage-status', icon: '🏭', label: 'Garage Status' },
    { to: '/services',      icon: '🔩', label: 'Request Service' },
    { to: '/settings',      icon: '⚙️', label: 'Settings' },
  ];

  if (user && user.is_staff) {
    navItems.push({ to: '/users', icon: '🔑', label: 'User Accounts' });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-4h12l2 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="7.5" cy="17.5" r="2.5" fill="white" opacity="0.9"/>
            <circle cx="16.5" cy="17.5" r="2.5" fill="white" opacity="0.9"/>
            <path d="M5 9h14" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          </svg>
        </div>
        <div className="sidebar-logo-text">
          <h2>car service</h2>
          <span>Management System</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section-title">Main Menu</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `nav-item${isActive ? ' active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn btn-ghost" onClick={toggleTheme} style={{ width: '100%', marginBottom: 16, justifyContent: 'center' }}>
          {themeLabel} Mode
        </button>
        <p>Car Service v1.0</p>
        <p style={{ marginTop: 4 }}>© 2024 All rights reserved</p>
      </div>
    </aside>
  );
}
