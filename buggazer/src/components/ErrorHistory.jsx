import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEnvironment } from '../context/EnvironmentContext';
import { initialErrors, generateLargeDataset } from '../data/errors';
import { filterErrors, sortErrors, getSeverityConfig, formatTimestamp, formatRelative } from '../utils/helpers';
import TopBar from './TopBar';
import SeverityBadge from './SeverityBadge';

// ── Constants ────────────────────────────────────────────────────────────────
const ROW_HEIGHT = 52; // px — each virtual row is exactly this tall
const OVERSCAN   = 8;  // extra rows to render above/below viewport

// Merge the real seed errors + 10 000 generated rows, generated once at module load
const ALL_ERRORS = [...initialErrors, ...generateLargeDataset(10000)];

const COLUMNS = [
  { key: 'severity',    label: 'Sev',          width: '72px'  },
  { key: 'message',     label: 'Error Message', width: '1fr'   },
  { key: 'service',     label: 'Service',       width: '140px' },
  { key: 'platform',    label: 'Platform',      width: '100px' },
  { key: 'environment', label: 'Env',           width: '110px' },
  { key: 'count',       label: 'Count',         width: '72px'  },
  { key: 'timestamp',   label: 'Time',          width: '150px' },
  { key: 'resolved',    label: 'Status',        width: '90px'  },
];

const GRID_COLS = COLUMNS.map(c => c.width).join(' ');

// ── Severity dot ─────────────────────────────────────────────────────────────
function SevDot({ severity }) {
  const cfg = getSeverityConfig(severity);
  return (
    <span style={{
      display: 'inline-block',
      width: '8px', height: '8px',
      borderRadius: '50%',
      background: cfg.dot,
      boxShadow: `0 0 5px ${cfg.dot}88`,
      flexShrink: 0,
    }} />
  );
}

// ── Environment pill ─────────────────────────────────────────────────────────
const ENV_STYLES = {
  production:  { bg: 'rgba(217,176,176,0.18)', color: '#7a3f3f', border: 'rgba(217,176,176,0.45)' },
  staging:     { bg: 'rgba(189,184,122,0.18)', color: '#5c5730', border: 'rgba(189,184,122,0.45)' },
  development: { bg: 'rgba(125,157,167,0.18)', color: '#2e5060', border: 'rgba(125,157,167,0.45)' },
};
function EnvPill({ env }) {
  const s = ENV_STYLES[env] || ENV_STYLES.development;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '10px',
      fontSize: '11px', fontWeight: '600',
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
    }}>
      {env}
    </span>
  );
}

// ── A single virtualised row ─────────────────────────────────────────────────
const VirtualRow = ({ error, style }) => {
  const [hovered, setHovered] = useState(false);
  const cfg = getSeverityConfig(error.severity);

  return (
    <div
      style={{
        ...style,
        display: 'grid',
        gridTemplateColumns: GRID_COLS,
        alignItems: 'center',
        gap: '12px',
        padding: '0 20px',
        borderBottom: '1px solid rgba(207,207,209,0.22)',
        background: hovered
          ? `${cfg.bg}`
          : 'transparent',
        transition: 'background 0.15s',
        cursor: 'default',
        boxSizing: 'border-box',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Severity */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <SevDot severity={error.severity} />
      </div>

      {/* Message */}
      <div style={{
        fontSize: '12px',
        color: cfg.text,
        fontFamily: 'JetBrains Mono, monospace',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {error.message}
      </div>

      {/* Service */}
      <div style={{
        fontSize: '12px', color: '#7d9da7', fontWeight: '500',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {error.service}
      </div>

      {/* Platform */}
      <div style={{ fontSize: '12px', color: '#aab6b9' }}>{error.platform}</div>

      {/* Environment */}
      <div><EnvPill env={error.environment} /></div>

      {/* Count */}
      <div style={{
        fontSize: '12px', fontWeight: '700', color: '#4a5d61',
        textAlign: 'right', fontFamily: 'JetBrains Mono, monospace',
      }}>
        ×{error.count.toLocaleString()}
      </div>

      {/* Timestamp */}
      <div style={{
        fontSize: '11px', color: '#aab6b9',
        fontFamily: 'JetBrains Mono, monospace',
        whiteSpace: 'nowrap',
      }}>
        {formatRelative(error.timestamp)}
      </div>

      {/* Status */}
      <div>
        <span style={{
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: '10px',
          fontSize: '11px', fontWeight: '600',
          background: error.resolved ? 'rgba(178,211,204,0.2)' : 'rgba(217,176,176,0.15)',
          color: error.resolved ? '#2e5f58' : '#7a3f3f',
          border: `1px solid ${error.resolved ? 'rgba(178,211,204,0.5)' : 'rgba(217,176,176,0.4)'}`,
        }}>
          {error.resolved ? 'Resolved' : 'Open'}
        </span>
      </div>
    </div>
  );
};

// ── Sort icon ────────────────────────────────────────────────────────────────
function SortIcon({ col, sortKey, sortDir }) {
  if (sortKey !== col) return <span style={{ color: 'rgba(196,184,245,0.5)', marginLeft: '4px' }}>↕</span>;
  return <span style={{ color: '#7c5cbf', marginLeft: '4px' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ErrorHistory() {
  const { environment } = useEnvironment();
  const [search, setSearch]       = useState('');
  const [useRegex, setUseRegex]   = useState(false);
  const [severity, setSeverity]   = useState('all');
  const [platform, setPlatform]   = useState('all');
  const [sortKey, setSortKey]     = useState('timestamp');
  const [sortDir, setSortDir]     = useState('desc');
  const [regexError, setRegexError] = useState(false);

  // Scrollable container ref — the virtualizer measures this
  const scrollRef = useRef(null);

  // ── Filter + sort (memoised) ────────────────────────────────────────────
  const filtered = useMemo(() => {
    // validate regex early for UX
    if (useRegex && search) {
      try { new RegExp(search); setRegexError(false); }
      catch { setRegexError(true); return []; }
    } else {
      setRegexError(false);
    }
    const f = filterErrors(ALL_ERRORS, { search, useRegex, severity, platform, environment });
    return sortErrors(f, sortKey, sortDir);
  }, [search, useRegex, severity, platform, environment, sortKey, sortDir]);

  // Reset scroll to top whenever filters change
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [filtered]);

  // ── Virtualizer ─────────────────────────────────────────────────────────
  const virtualizer = useVirtualizer({
    count:         filtered.length,
    getScrollElement: () => scrollRef.current,
    estimateSize:  () => ROW_HEIGHT,
    overscan:      OVERSCAN,
  });

  // ── Sort handler ─────────────────────────────────────────────────────────
  const handleSort = useCallback((key) => {
    setSortKey(k => {
      if (k === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return k; }
      setSortDir('asc');
      return key;
    });
  }, []);

  const totalRows   = virtualizer.getTotalSize();   // total pixel height
  const virtualRows = virtualizer.getVirtualItems(); // only the visible slice

  return (
    <div className="fade-in">
      <TopBar
        title="Error History"
        subtitle={`Virtual-scroll • ${filtered.length.toLocaleString()} / ${ALL_ERRORS.length.toLocaleString()} rows`}
      />

      <div style={{ padding: '28px' }}>

        {/* ── Filters bar ──────────────────────────────────────────────── */}
        <div style={{
          background: 'rgba(255,255,255,0.88)',
          border: '1px solid rgba(196,184,245,0.35)',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '16px',
          display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end',
          boxShadow: '0 2px 12px rgba(196,184,245,0.1)',
        }}>

          {/* Search */}
          <div style={{ flex: '1 1 280px' }}>
            <label style={{ fontSize: '11px', color: '#9b96c0', display: 'block', marginBottom: '5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Search Errors
            </label>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: regexError ? '#c07070' : '#9b96c0' }}
                width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                id="search-input"
                type="text"
                placeholder={useRegex ? 'Enter regex, e.g.  TypeError|RangeError' : 'Search by message or service…'}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field"
                style={{
                  paddingLeft: '30px',
                  border: regexError ? '1px solid rgba(192,112,112,0.6)' : undefined,
                }}
              />
            </div>
            {regexError && (
              <div style={{ fontSize: '11px', color: '#c07070', marginTop: '4px' }}>⚠ Invalid regular expression</div>
            )}
          </div>

          {/* Regex toggle */}
          <div style={{ flexShrink: 0 }}>
            <label style={{ fontSize: '11px', color: '#9b96c0', display: 'block', marginBottom: '5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Mode
            </label>
            <button
              id="regex-toggle"
              onClick={() => setUseRegex(r => !r)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: `1px solid ${useRegex ? 'rgba(196,184,245,0.65)' : 'rgba(196,184,245,0.3)'}`,
                background: useRegex ? 'rgba(196,184,245,0.22)' : 'rgba(255,255,255,0.7)',
                color: useRegex ? '#7c5cbf' : '#9b96c0',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              .* Regex {useRegex ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Severity */}
          <div style={{ flex: '0 1 140px' }}>
            <label style={{ fontSize: '11px', color: '#9b96c0', display: 'block', marginBottom: '5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Severity</label>
            <select id="severity-filter" value={severity} onChange={e => setSeverity(e.target.value)} className="input-field">
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>

          {/* Platform */}
          <div style={{ flex: '0 1 140px' }}>
            <label style={{ fontSize: '11px', color: '#9b96c0', display: 'block', marginBottom: '5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform</label>
            <select id="platform-filter" value={platform} onChange={e => setPlatform(e.target.value)} className="input-field">
              <option value="all">All Platforms</option>
              <option value="web">Web</option>
              <option value="nodejs">Node.js</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>

          {/* Result count badge */}
          <div style={{ flexShrink: 0, paddingBottom: '2px' }}>
            <div style={{ fontSize: '13px', color: '#9b96c0', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#2d2b55' }}>
                {filtered.length.toLocaleString()}
              </span>{' '}
              <span style={{ fontSize: '12px' }}>results</span>
            </div>
          </div>
        </div>

        {/* ── Virtual table ────────────────────────────────────────────── */}
        <div style={{
          background: 'rgba(255,255,255,0.88)',
          border: '1px solid rgba(196,184,245,0.35)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(196,184,245,0.1)',
        }}>

          {/* Sticky header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: GRID_COLS,
            gap: '12px',
            padding: '12px 20px',
            background: 'rgba(247,246,254,0.95)',
            borderBottom: '1px solid rgba(196,184,245,0.3)',
            position: 'sticky', top: 0, zIndex: 2,
          }}>
            {COLUMNS.map(col => (
              <div
                key={col.key}
                onClick={() => handleSort(col.key)}
                style={{
                  fontSize: '11px', fontWeight: '700',
                  color: sortKey === col.key ? '#7c5cbf' : '#9b96c0',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  cursor: 'pointer', userSelect: 'none',
                  display: 'flex', alignItems: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {col.label}
                <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
              </div>
            ))}
          </div>

          {/* Scrollable virtual area */}
          <div
            ref={scrollRef}
            id="virtual-scroll-container"
            style={{
              height: '560px',
              overflowY: 'auto',
              overflowX: 'hidden',
              position: 'relative',
            }}
          >
            {filtered.length === 0 ? (
              <div style={{ padding: '80px', textAlign: 'center', color: '#9b96c0' }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔍</div>
                <div>No errors match your filters</div>
              </div>
            ) : (
              /* Total-height spacer → gives the scrollbar its correct length */
              <div style={{ height: `${totalRows}px`, width: '100%', position: 'relative' }}>
                {virtualRows.map(vRow => (
                  <VirtualRow
                    key={vRow.key}
                    error={filtered[vRow.index]}
                    style={{
                      position: 'absolute',
                      top: `${vRow.start}px`,
                      left: 0,
                      width: '100%',
                      height: `${ROW_HEIGHT}px`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer bar */}
          <div style={{
            padding: '10px 20px',
            borderTop: '1px solid rgba(196,184,245,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(247,246,254,0.6)',
          }}>
            <div style={{ fontSize: '12px', color: '#9b96c0' }}>
              Showing{' '}
              <strong style={{ color: '#2d2b55' }}>
                {Math.min(virtualRows.length + OVERSCAN, filtered.length).toLocaleString()}
              </strong>{' '}
              rendered of{' '}
              <strong style={{ color: '#2d2b55' }}>{filtered.length.toLocaleString()}</strong> rows
              {' '}—{' '}scroll to see more
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '12px', color: '#9b96c0',
            }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#b2d3cc',
                boxShadow: '0 0 6px rgba(178,211,204,0.7)',
                animation: 'pulse 2s ease infinite',
                display: 'inline-block',
              }} />
              Virtual scrolling active — lag-free at any dataset size
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
