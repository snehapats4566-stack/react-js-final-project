import { useEnvironment } from '../context/EnvironmentContext';

export default function TopBar({ title, subtitle }) {
  const { currentEnv } = useEnvironment();

  return (
    <header
      style={{
        height: '64px',
        background: 'var(--bg-topbar)',
        borderBottom: '1px solid var(--border-color)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow-topbar)',
        transition: 'background 0.3s ease',
      }}
    >
      <div>
        <h1 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-heading)', letterSpacing: '-0.02em' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '1px' }}>{subtitle}</p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Environment badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '5px 12px',
          background: `${currentEnv?.color}15`,
          border: `1px solid ${currentEnv?.color}45`,
          borderRadius: '20px',
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: currentEnv?.color,
            animation: 'floatDot 2s ease infinite',
          }} />
          <span style={{ fontSize: '12px', fontWeight: '600', color: currentEnv?.color }}>
            {currentEnv?.label}
          </span>
        </div>

        {/* Time */}
        <div style={{ fontSize: '12px', color: '#aab6b9', fontFamily: 'JetBrains Mono, monospace' }}>
          {new Date().toLocaleTimeString('en-US', { hour12: false })}
        </div>

        {/* Avatar */}
        <div style={{
          width: '32px', height: '32px',
          background: 'linear-gradient(135deg, #b2d3cc, #7d9da7)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: '700', color: '#2b4249',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(125,157,167,0.3)',
        }}>
          BG
        </div>
      </div>
    </header>
  );
}
