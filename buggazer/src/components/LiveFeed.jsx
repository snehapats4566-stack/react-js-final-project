import { useState } from 'react';
import { useEnvironment } from '../context/EnvironmentContext';
import { useLiveFeed } from '../hooks/useLiveFeed';
import { getSeverityConfig, formatRelative } from '../utils/helpers';
import TopBar from './TopBar';
import SeverityBadge from './SeverityBadge';

// Palette: Mint #b2d3cc | Rose #d9b0b0 | Silver #cfcfd1 | Sage #bdb87a | Slate #7d9da7

const CARD = {
  bg: 'rgba(255,255,255,0.88)',
  border: 'rgba(207,207,209,0.45)',
  shadow: '0 2px 14px rgba(207,207,209,0.25)',
};

export default function LiveFeed() {
  const { environment } = useEnvironment();
  const [isRunning, setIsRunning] = useState(true);
  const { liveErrors, clearFeed } = useLiveFeed(environment, isRunning);
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  const displayed = selectedSeverity === 'all'
    ? liveErrors
    : liveErrors.filter(e => e.severity === selectedSeverity);

  const sevFilters = [
    { key: 'all',      label: 'All',      bg: 'rgba(207,207,209,0.2)',   border: 'rgba(207,207,209,0.5)',   active: 'rgba(125,157,167,0.2)',   activeBorder: 'rgba(125,157,167,0.5)',   color: '#2e5060' },
    { key: 'critical', label: 'Critical', bg: 'transparent',             border: 'rgba(217,176,176,0.35)', active: 'rgba(217,176,176,0.25)', activeBorder: 'rgba(217,176,176,0.6)',   color: '#7a3f3f' },
    { key: 'warning',  label: 'Warning',  bg: 'transparent',             border: 'rgba(189,184,122,0.35)', active: 'rgba(189,184,122,0.2)',  activeBorder: 'rgba(189,184,122,0.6)',   color: '#5c5730' },
    { key: 'info',     label: 'Info',     bg: 'transparent',             border: 'rgba(125,157,167,0.35)', active: 'rgba(178,211,204,0.2)',  activeBorder: 'rgba(178,211,204,0.6)',   color: '#2e5f58' },
  ];

  return (
    <div className="fade-in">
      <TopBar title="Live Error Feed" subtitle="Real-time error stream" />

      <div style={{ padding: '28px' }}>
        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>

          {/* Live indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 14px',
            background: isRunning ? 'rgba(178,211,204,0.2)' : 'rgba(207,207,209,0.2)',
            border: `1px solid ${isRunning ? 'rgba(178,211,204,0.55)' : 'rgba(207,207,209,0.4)'}`,
            borderRadius: '20px',
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: isRunning ? '#b2d3cc' : '#cfcfd1',
              animation: isRunning ? 'floatDot 1.5s ease infinite' : 'none',
              boxShadow: isRunning ? '0 0 8px rgba(178,211,204,0.7)' : 'none',
            }} />
            <span style={{ fontSize: '13px', fontWeight: '600', color: isRunning ? '#2e5f58' : '#7a8e92' }}>
              {isRunning ? 'LIVE' : 'PAUSED'}
            </span>
          </div>

          <button id="feed-toggle-btn" className="btn-primary" onClick={() => setIsRunning(r => !r)}>
            {isRunning ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
            {isRunning ? 'Pause Feed' : 'Resume Feed'}
          </button>

          <button className="btn-secondary" onClick={clearFeed} id="feed-clear-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Clear Feed
          </button>

          {/* Severity filter */}
          <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
            {sevFilters.map(f => (
              <button
                key={f.key}
                id={`filter-${f.key}`}
                onClick={() => setSelectedSeverity(f.key)}
                style={{
                  padding: '6px 12px', borderRadius: '20px',
                  border: `1px solid ${selectedSeverity === f.key ? f.activeBorder : f.border}`,
                  background: selectedSeverity === f.key ? f.active : f.bg,
                  color: selectedSeverity === f.key ? f.color : '#7a8e92',
                  fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  textTransform: 'capitalize', transition: 'all 0.2s',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '13px', color: '#aab6b9' }}>
            <span style={{ color: '#3d4a4d', fontWeight: '700' }}>{displayed.length}</span> events
          </div>
        </div>

        {/* Feed container */}
        <div style={{ background: CARD.bg, border: `1px solid ${CARD.border}`, borderRadius: '16px', overflow: 'hidden', boxShadow: CARD.shadow }}>
          {/* Mac-style header bar */}
          <div style={{
            padding: '12px 20px',
            background: 'rgba(247,246,244,0.8)',
            borderBottom: '1px solid rgba(207,207,209,0.35)',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d9b0b0' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#bdb87a' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#b2d3cc' }} />
            <span style={{ marginLeft: '8px', fontSize: '12px', color: '#aab6b9', fontFamily: 'JetBrains Mono, monospace' }}>
              buggazer://live-feed/{environment}
            </span>
          </div>

          {/* Error entries */}
          <div style={{ maxHeight: '600px', overflowY: 'auto', padding: '8px' }}>
            {displayed.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
                <div style={{ color: '#aab6b9', fontSize: '14px' }}>
                  {isRunning ? 'Waiting for errors...' : 'Feed is paused. Resume to see live errors.'}
                </div>
              </div>
            ) : (
              displayed.map((error, i) => {
                const config = getSeverityConfig(error.severity);
                return (
                  <div
                    key={error.id}
                    className={i === 0 ? 'feed-entry' : ''}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '12px',
                      padding: '10px 12px', borderRadius: '8px', marginBottom: '4px',
                      background: i === 0 ? config.bg : 'transparent',
                      border: i === 0 ? `1px solid ${config.border}` : '1px solid transparent',
                      transition: 'all 0.3s',
                    }}
                  >
                    {/* Severity bar */}
                    <div style={{
                      width: '4px', height: '100%', minHeight: '36px',
                      background: config.dot,
                      borderRadius: '2px', flexShrink: 0,
                    }} />

                    {/* Timestamp */}
                    <div style={{
                      fontSize: '11px', color: '#aab6b9',
                      fontFamily: 'JetBrains Mono, monospace',
                      flexShrink: 0, paddingTop: '2px', minWidth: '60px',
                    }}>
                      {formatRelative(error.timestamp)}
                    </div>

                    {/* Badge */}
                    <div style={{ flexShrink: 0, paddingTop: '1px' }}>
                      <SeverityBadge severity={error.severity} />
                    </div>

                    {/* Message */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '13px', color: config.text,
                        fontFamily: 'JetBrains Mono, monospace',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {error.message}
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '3px' }}>
                        <span style={{ fontSize: '11px', color: '#7d9da7', fontWeight: '500' }}>{error.service}</span>
                        <span style={{ fontSize: '11px', color: '#aab6b9' }}>{error.platform}</span>
                      </div>
                    </div>

                    {/* Count */}
                    <div style={{
                      fontSize: '12px', color: '#7a8e92',
                      background: 'rgba(207,207,209,0.25)',
                      padding: '2px 8px', borderRadius: '6px',
                      fontWeight: '600', flexShrink: 0,
                      border: '1px solid rgba(207,207,209,0.4)',
                    }}>
                      ×{error.count}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { label: 'Critical Events', count: liveErrors.filter(e => e.severity === 'critical').length, color: '#7a3f3f', bg: 'rgba(217,176,176,0.15)', border: 'rgba(217,176,176,0.4)' },
            { label: 'Warnings',        count: liveErrors.filter(e => e.severity === 'warning').length,  color: '#5c5730', bg: 'rgba(189,184,122,0.15)', border: 'rgba(189,184,122,0.4)' },
            { label: 'Info Events',     count: liveErrors.filter(e => e.severity === 'info').length,     color: '#2e5060', bg: 'rgba(125,157,167,0.12)', border: 'rgba(125,157,167,0.35)' },
          ].map(stat => (
            <div key={stat.label} style={{
              padding: '14px 18px',
              background: stat.bg,
              border: `1px solid ${stat.border}`,
              borderRadius: '12px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: '13px', color: '#7a8e92' }}>{stat.label}</span>
              <span style={{ fontSize: '22px', fontWeight: '800', color: stat.color }}>{stat.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
