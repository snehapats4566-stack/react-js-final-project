import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useEnvironment } from '../context/EnvironmentContext';
import { initialErrors, topErrorSources } from '../data/errors';
import { getErrorCounts, getSeverityConfig, formatRelative } from '../utils/helpers';
import StatCard from './StatCard';
import TopBar from './TopBar';
import SeverityBadge from './SeverityBadge';

// Palette: Mint #b2d3cc | Rose #d9b0b0 | Silver #cfcfd1 | Sage #bdb87a | Slate #7d9da7

const TotalIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);
const CriticalIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const WarningIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const AlertIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const CARD = {
  bg: 'rgba(255,255,255,0.88)',
  border: 'rgba(207,207,209,0.45)',
  shadow: '0 2px 14px rgba(207,207,209,0.25)',
  divider: 'rgba(207,207,209,0.35)',
};

export default function Dashboard() {
  const { environment } = useEnvironment();

  const filteredErrors = useMemo(() => {
    if (environment === 'all') return initialErrors;
    return initialErrors.filter(e => e.environment === environment);
  }, [environment]);

  const counts = useMemo(() => getErrorCounts(filteredErrors), [filteredErrors]);
  const activeAlerts = filteredErrors.filter(e => !e.resolved && e.severity === 'critical').length;

  const recentErrors = useMemo(() =>
    [...filteredErrors].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 6),
    [filteredErrors]
  );

  // Bar gradient config for top sources
  const barGrads = [
    'linear-gradient(90deg, #d9b0b0, #cfcfd1)',  // rose → silver
    'linear-gradient(90deg, #bdb87a, #b2d3cc)',   // sage → mint
    'linear-gradient(90deg, #7d9da7, #b2d3cc)',   // slate → mint
    'linear-gradient(90deg, #cfcfd1, #b2d3cc)',
    'linear-gradient(90deg, #b2d3cc, #7d9da7)',
  ];

  return (
    <div className="fade-in">
      <TopBar
        title="Dashboard Overview"
        subtitle={`Monitoring ${environment} environment`}
      />

      <div style={{ padding: '28px' }}>
        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <StatCard title="Total Errors"    value={counts.total}    subtitle="All severities"           icon={<TotalIcon />}    color="blue"   trend={12} />
          <StatCard title="Critical Errors" value={counts.critical} subtitle="Requires immediate action" icon={<CriticalIcon />} color="red"    trend={8} />
          <StatCard title="Warnings"        value={counts.warning}  subtitle="Non-critical issues"       icon={<WarningIcon />}  color="yellow" trend={-3} />
          <StatCard title="Active Alerts"   value={activeAlerts}    subtitle="Unresolved critical"       icon={<AlertIcon />}    color="mint"   trend={5} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>
          {/* Recent errors */}
          <div style={{ background: CARD.bg, border: `1px solid ${CARD.border}`, borderRadius: '16px', overflow: 'hidden', boxShadow: CARD.shadow }}>
            <div style={{ padding: '18px 20px', borderBottom: `1px solid ${CARD.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#3d4a4d' }}>Recent Errors</h2>
                <p style={{ fontSize: '12px', color: '#aab6b9', marginTop: '2px' }}>Latest from {environment}</p>
              </div>
              <Link to="/history" style={{ fontSize: '12px', color: '#7d9da7', fontWeight: '500', textDecoration: 'none' }}>
                View all →
              </Link>
            </div>
            <div>
              {recentErrors.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#aab6b9' }}>
                  No errors in {environment} environment
                </div>
              ) : (
                recentErrors.map((error, i) => (
                  <div
                    key={error.id}
                    style={{
                      padding: '14px 20px',
                      borderBottom: i < recentErrors.length - 1 ? `1px solid ${CARD.divider}` : 'none',
                      display: 'flex', alignItems: 'flex-start', gap: '12px',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(178,211,204,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, marginTop: '5px',
                      background: getSeverityConfig(error.severity).dot,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '13px', color: '#4a5d61', fontFamily: 'JetBrains Mono, monospace',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {error.message}
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '5px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#7d9da7', fontWeight: '500' }}>{error.service}</span>
                        <span style={{ fontSize: '11px', color: '#cfcfd1' }}>•</span>
                        <span style={{ fontSize: '11px', color: '#aab6b9' }}>{formatRelative(error.timestamp)}</span>
                      </div>
                    </div>
                    <SeverityBadge severity={error.severity} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top error sources */}
          <div style={{ background: CARD.bg, border: `1px solid ${CARD.border}`, borderRadius: '16px', overflow: 'hidden', boxShadow: CARD.shadow }}>
            <div style={{ padding: '18px 20px', borderBottom: `1px solid ${CARD.divider}` }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#3d4a4d' }}>Top Error Sources</h2>
              <p style={{ fontSize: '12px', color: '#aab6b9', marginTop: '2px' }}>By error volume</p>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topErrorSources.map((src, i) => {
                const maxErrors = topErrorSources[0].errors;
                const pct = (src.errors / maxErrors) * 100;
                const trendColor = src.trend === 'up' ? '#c07070' : src.trend === 'down' ? '#4a8a80' : '#aab6b9';
                const trendIcon = src.trend === 'up' ? '↑' : src.trend === 'down' ? '↓' : '→';
                return (
                  <div key={src.service}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#aab6b9', width: '18px', textAlign: 'center' }}>#{i + 1}</span>
                        <span style={{ fontSize: '13px', color: '#3d4a4d', fontWeight: '500' }}>{src.service}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#4a5d61' }}>{src.errors.toLocaleString()}</span>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: trendColor }}>{trendIcon}</span>
                      </div>
                    </div>
                    <div style={{ height: '5px', background: 'rgba(207,207,209,0.3)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${pct}%`,
                        background: barGrads[i] || barGrads[4],
                        borderRadius: '3px', transition: 'width 1s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Stats row */}
        <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { label: 'Avg Resolution Time', value: '14m 32s', icon: '⏱', color: '#7d9da7' },
            { label: 'Error Rate / min', value: counts.total > 0 ? `${(counts.total / 60).toFixed(1)}` : '0', icon: '📈', color: '#bdb87a' },
            { label: 'Services Affected', value: new Set(filteredErrors.map(e => e.service)).size, icon: '🔧', color: '#b2d3cc' },
          ].map(item => (
            <div key={item.label} style={{
              background: CARD.bg,
              border: `1px solid ${CARD.border}`,
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: '14px',
              boxShadow: CARD.shadow,
            }}>
              <span style={{ fontSize: '24px' }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: '11px', color: '#aab6b9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: item.color, marginTop: '2px' }}>
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
