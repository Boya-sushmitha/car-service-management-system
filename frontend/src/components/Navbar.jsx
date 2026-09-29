import React, { useContext } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const pageTitles = {
  '/dashboard': { title: 'Dashboard',  subtitle: 'Overview of your car management operations' },
  '/cars':      { title: 'Cars',       subtitle: 'Manage your vehicle inventory' },
  '/customers': { title: 'Customers',  subtitle: 'Manage customer profiles' },
  '/services':  { title: 'Services',   subtitle: 'Track maintenance and service records' },
  '/bookings':  { title: 'Bookings',   subtitle: 'Schedule and manage appointments' },
};

export default function Navbar({ onAdd, addLabel }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();

  const isPublicPage = !user || ['/', '/login', '/register', '/admin-login', '/about-us'].includes(location.pathname);
  const info = pageTitles[location.pathname] || { title: 'Car Service', subtitle: 'Manage & track vehicle services' };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about-us', label: 'About Us' },
    { path: '/admin-login', label: 'Admin Portal' },
  ];

  return (
    <header 
      style={{
        position: 'fixed',
        top: 0,
        left: isPublicPage ? 0 : 'var(--sidebar-width)',
        width: isPublicPage ? '100%' : 'calc(100% - var(--sidebar-width))',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 36px',
        zIndex: 1000,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: theme === 'light' 
          ? 'rgba(248, 250, 252, 0.85)' 
          : 'rgba(10, 14, 26, 0.85)',
        borderBottom: `1px solid ${theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'}`,
        transition: 'all 0.3s ease',
      }}
    >
      {/* ── 1. Left: Brand Logo / Page Title ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {isPublicPage ? (
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: 42, height: 42, borderRadius: '12px',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
            }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25 19L30 16.5V21.5L25 19Z" fill="#38bdf8" opacity="0.5" />
                <path d="M3 21L6 16.5C7.5 12.5 11 10.5 16 10.5H22L27 14.5L29 18C29.5 19 29 21 27.5 21H3Z" fill="url(#brandCarGrad)"/>
                <path d="M9.5 13C11 11.5 13 11 16 11H20.5L24 14.5H11L9.5 13Z" fill="#0f172a" opacity="0.85"/>
                <circle cx="9" cy="21" r="3.5" fill="#0f172a" stroke="#ffffff" strokeWidth="1.5"/>
                <circle cx="9" cy="21" r="1.2" fill="#38bdf8"/>
                <circle cx="23" cy="21" r="3.5" fill="#0f172a" stroke="#ffffff" strokeWidth="1.5"/>
                <circle cx="23" cy="21" r="1.2" fill="#38bdf8"/>
                <defs>
                  <linearGradient id="brandCarGrad" x1="3" y1="10.5" x2="29" y2="21" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366f1"/>
                    <stop offset="1" stopColor="#38bdf8"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.4px', lineHeight: 1.1 }}>
                Car Service
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Automotive Service System
              </span>
            </div>
          </Link>
        ) : (
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{info.title}</h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>{info.subtitle}</p>
          </div>
        )}
      </div>

      {/* ── 2. Center: Clean Production Navigation Links (No Pill Box Clutter) ── */}
      {isPublicPage && (
        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive 
                    ? '#f97316' 
                    : 'var(--text-secondary)',
                  position: 'relative',
                  padding: '6px 0',
                  transition: 'color 0.2s ease',
                }}
                onMouseOver={(e) => {
                  if (!isActive) e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {link.label}
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    bottom: -2,
                    left: 0,
                    right: 0,
                    height: 2,
                    borderRadius: 1,
                    background: 'linear-gradient(90deg, #f97316, #ef4444)',
                    boxShadow: '0 0 8px rgba(249,115,22,0.6)',
                  }} />
                )}
              </Link>
            );
          })}
        </nav>
      )}

      {/* ── 3. Right: Action Controls (Theme Switcher, Login, Register) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {onAdd && (
          <button className="navbar-btn" onClick={onAdd} id="btn-add-new">
            <span>＋</span>
            <span>{addLabel ? addLabel.replace(/^\+\s*/, '') : 'Add New'}</span>
          </button>
        )}

        {/* Real Web Toggle Switch */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            position: 'relative',
            width: 48,
            height: 26,
            borderRadius: 13,
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            background: theme === 'dark'
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(0,0,0,0.08)',
            boxShadow: 'inset 0 0 0 1px rgba(128,128,128,0.2)',
            transition: 'background 0.3s ease',
            flexShrink: 0,
          }}
        >
          <span style={{
            position: 'absolute',
            top: 3,
            left: theme === 'dark' ? 25 : 3,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: theme === 'dark' ? '#38bdf8' : '#f59e0b',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            transition: 'left 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            color: '#ffffff',
          }}>
            {theme === 'dark' ? '🌙' : '☀️'}
          </span>
        </button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
              Hi, {user.username}
            </span>
            {user.is_staff && (
              <Link to="/admin-login" style={{ 
                textDecoration: 'none', padding: '6px 12px', fontSize: '13px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '6px' 
              }}>Admin</Link>
            )}
            <button onClick={handleLogout} style={{
                padding: '6px 14px', fontSize: '13px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s'
            }}>Logout</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              to="/login"
              style={{
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                padding: '8px 16px',
                borderRadius: '8px',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              Sign In
            </Link>

            <Link
              to="/register"
              style={{
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                background: 'linear-gradient(135deg, #f97316, #ef4444)',
                padding: '8px 20px',
                borderRadius: '8px',
                boxShadow: '0 4px 15px rgba(249, 115, 22, 0.35)',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(249, 115, 22, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(249, 115, 22, 0.35)';
              }}
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
