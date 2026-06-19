import { NavLink, useLocation } from 'react-router-dom';
import { useEnvironment } from '../context/EnvironmentContext';

const navItems = [
  {
    path: '/',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    path: '/feed',
    label: 'Live Feed',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
      </svg>
    ),
    live: true,
  },
  {
    path: '/history',
    label: 'Error History',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    path: '/analytics',
    label: 'Analytics',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    path: '/alerts',
    label: 'Alerts',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const { environment, setEnvironment, environments, currentEnv } = useEnvironment();

  return (
    <aside
      style={{
        width: '240px',
        minHeight: '100vh',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-sidebar)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
        boxShadow: 'var(--shadow-sidebar)',
        transition: 'background 0.3s ease',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border-sidebar)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #b2d3cc, #7d9da7)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(125,157,167,0.3)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-sidebar-brand)', letterSpacing: '-0.02em' }}>
              Bug<span className="gradient-text">Gazer</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Error Monitor
            </div>
          </div>
        </div>
      </div>

      {/* Environment Selector */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-sidebar)' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: '600' }}>
          Environment
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {environments.map(env => (
            <button
              key={env.value}
              onClick={() => setEnvironment(env.value)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '7px 10px',
                borderRadius: '8px',
                border: environment === env.value ? `1px solid ${env.color}50` : '1px solid transparent',
                background: environment === env.value ? `${env.color}18` : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <span style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: env.color,
                flexShrink: 0,
                animation: environment === env.value ? 'floatDot 2s ease infinite' : 'none',
              }} />
              <span style={{
                fontSize: '13px',
                fontWeight: environment === env.value ? '600' : '400',
                color: environment === env.value ? env.color : '#7a8e92',
              }}>
                {env.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', paddingLeft: '4px', fontWeight: '600' }}>
          Navigation
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.live && (
                <span style={{
                  marginLeft: 'auto',
                  width: '7px', height: '7px',
                  background: '#b2d3cc',
                  borderRadius: '50%',
                  animation: 'floatDot 1.5s ease infinite',
                  boxShadow: '0 0 6px rgba(178,211,204,0.8)',
                }} />
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-sidebar)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 10px',
          background: 'rgba(178,211,204,0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(178,211,204,0.3)',
        }}>
          <span style={{ width: '7px', height: '7px', background: '#7d9da7', borderRadius: '50%', animation: 'floatDot 2s ease infinite' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>System Operational</span>
        </div>
        <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-faint)', textAlign: 'center' }}>
          BugGazer v1.0.0
        </div>
      </div>
    </aside>
  );
}
