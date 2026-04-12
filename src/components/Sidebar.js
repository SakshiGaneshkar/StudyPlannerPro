import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '⚡', label: 'Dashboard' },
  { to: '/planner', icon: '📋', label: 'Planner' },
  { to: '/calendar', icon: '📅', label: 'Calendar' },
  { to: '/focus', icon: '🎯', label: 'Focus Mode' },
  { to: '/habits', icon: '🔥', label: 'Habits' },
  { to: '/analytics', icon: '📊', label: 'Analytics' },
  { to: '/profile', icon: '👤', label: 'Profile' },
  { to: '/help', icon: '❓', label: 'Help' },
  { to: '/about', icon: '✨', label: 'About' },
];

export default function Sidebar() {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  const sidebarStyle = {
    width: collapsed ? '72px' : 'var(--sidebar-w)',
    position: 'fixed',
    top: 0, left: 0, bottom: 0,
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
    overflow: 'hidden',
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          display: 'none',
          position: 'fixed', top: 16, left: 16,
          zIndex: 200, background: 'var(--accent)', border: 'none',
          borderRadius: '10px', padding: '10px', cursor: 'pointer',
          color: '#fff', fontSize: '18px',
        }}
        className="mobile-menu-btn"
      >☰</button>

      <aside style={sidebarStyle} className="sidebar">
        {/* Logo */}
        <div style={{ padding: collapsed ? '20px 16px' : '24px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--accent), #8b80ff)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎓</div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, lineHeight: 1 }}>StudyPro</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>AI Planner</div>
              </div>
            </div>
          )}
          {collapsed && <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--accent), #8b80ff)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, margin: '0 auto' }}>🎓</div>}
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16, padding: 4, borderRadius: 6, transition: 'var(--transition)', flexShrink: 0 }}
            title={collapsed ? 'Expand' : 'Collapse'}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* User mini profile */}
        {!collapsed && user && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-2), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>🔥 {user.streak || 0} day streak</div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
          {!collapsed && <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, padding: '8px 10px 4px', fontWeight: 600 }}>Main Menu</div>}
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: collapsed ? '12px' : '11px 12px',
                borderRadius: 10, marginBottom: 2,
                textDecoration: 'none', justifyContent: collapsed ? 'center' : 'flex-start',
                background: isActive ? 'rgba(108,99,255,0.15)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 400, fontSize: 14,
                borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                transition: 'var(--transition)',
              })}
              title={collapsed ? label : ''}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
              {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
          <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: collapsed ? '12px' : '11px 12px', width: '100%', borderRadius: 10, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, justifyContent: collapsed ? 'center' : 'flex-start', transition: 'var(--transition)' }}
            title={collapsed ? 'Toggle Theme' : ''}>
            <span style={{ fontSize: 18 }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
            {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: collapsed ? '12px' : '11px 12px', width: '100%', borderRadius: 10, background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 14, justifyContent: collapsed ? 'center' : 'flex-start', transition: 'var(--transition)' }}
            title={collapsed ? 'Logout' : ''}>
            <span style={{ fontSize: 18 }}>🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Spacer for main content */}
      <style>{`
        .main-content { margin-left: ${collapsed ? '72px' : 'var(--sidebar-w)'}; transition: margin-left 0.3s ease; }
        @media (max-width: 1024px) {
          .main-content { margin-left: 0 !important; }
          .sidebar { transform: translateX(${mobileOpen ? '0' : '-100%'}); width: var(--sidebar-w) !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
