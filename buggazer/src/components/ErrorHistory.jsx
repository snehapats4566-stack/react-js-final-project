import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEnvironment } from '../context/EnvironmentContext';
import { useErrors } from '../context/ErrorsContext';
import { filterErrors, sortErrors, getSeverityConfig, formatRelative } from '../utils/helpers';
import TopBar from './TopBar';

// ── Constants ────────────────────────────────────────────────────────────────
const ROW_HEIGHT = 52;
const OVERSCAN   = 8;


const COLUMNS = [
  { key: 'select',      label: '',             width: '36px'  },
  { key: 'severity',    label: 'Sev',          width: '60px'  },
  { key: 'message',     label: 'Error Message', width: '1fr'  },
  { key: 'service',     label: 'Service',       width: '140px' },
  { key: 'platform',    label: 'Platform',      width: '100px' },
  { key: 'environment', label: 'Env',           width: '110px' },
  { key: 'count',       label: 'Count',         width: '72px'  },
  { key: 'timestamp',   label: 'Time',          width: '150px' },
  { key: 'resolved',    label: 'Status',        width: '90px'  },
  { key: 'actions',     label: '',              width: '44px'  },
];

const GRID_COLS = COLUMNS.map(c => c.width).join(' ');

// ── Severity dot ──────────────────────────────────────────────────────────────
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

// ── Environment pill ──────────────────────────────────────────────────────────
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

// ── Trash icon ────────────────────────────────────────────────────────────────
function TrashIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

// ── Virtual row ───────────────────────────────────────────────────────────────
const VirtualRow = ({ error, style, selected, onSelect, onDelete }) => {
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
        background: selected
          ? 'rgba(196,184,245,0.12)'
          : hovered ? cfg.bg : 'transparent',
        transition: 'background 0.15s',
        cursor: 'default',
        boxSizing: 'border-box',
        outline: selected ? '1px solid rgba(196,184,245,0.35)' : 'none',
        borderLeft: error.isLive ? '3px solid #b2d3cc' : '3px solid transparent',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Checkbox */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(error.id)}
          onClick={e => e.stopPropagation()}
          style={{ width: '14px', height: '14px', cursor: 'pointer', accentColor: '#7c5cbf' }}
        />
      </div>

      {/* Severity */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <SevDot severity={error.severity} />
      </div>

      {/* Message */}
      <div style={{
        fontSize: '12px',
        color: cfg.text,
        fontFamily: 'JetBrains Mono, monospace',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        {error.isLive && (
          <span style={{
            fontSize: '9px', fontWeight: '700', letterSpacing: '0.06em',
            background: 'rgba(178,211,204,0.3)',
            color: '#2e5f58',
            border: '1px solid rgba(178,211,204,0.7)',
            borderRadius: '4px',
            padding: '1px 5px',
            flexShrink: 0,
            animation: 'pulse 2s ease infinite',
          }}>LIVE</span>
        )}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {error.message}
        </span>
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

      {/* Delete action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button
          title="Delete this error"
          onClick={e => { e.stopPropagation(); onDelete([error.id]); }}
          style={{
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.15s, background 0.15s',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '5px',
            borderRadius: '6px',
            color: '#c07070',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(192,112,112,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
};

// ── Sort icon ─────────────────────────────────────────────────────────────────
function SortIcon({ col, sortKey, sortDir }) {
  if (sortKey !== col) return <span style={{ color: 'rgba(196,184,245,0.5)', marginLeft: '4px' }}>↕</span>;
  return <span style={{ color: '#7c5cbf', marginLeft: '4px' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
}

// ── Confirm modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(30,25,60,0.45)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '18px',
        padding: '32px 36px',
        maxWidth: '400px', width: '90%',
        boxShadow: '0 20px 60px rgba(30,25,60,0.22)',
        border: '1px solid rgba(196,184,245,0.4)',
        textAlign: 'center',
        animation: 'fadeIn 0.18s ease',
      }}>
        <div style={{ fontSize: '40px', marginBottom: '14px' }}>🗑️</div>
        <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#2d2b55', marginBottom: '10px' }}>
          Delete History
        </h2>
        <p style={{ fontSize: '13px', color: '#7d8090', lineHeight: '1.6', marginBottom: '24px' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '9px 22px',
              borderRadius: '9px',
              border: '1px solid rgba(207,207,209,0.6)',
              background: 'rgba(247,246,254,0.9)',
              color: '#7d8090',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '9px 22px',
              borderRadius: '9px',
              border: 'none',
              background: 'linear-gradient(135deg, #c07070, #a04848)',
              color: '#fff',
              fontSize: '13px', fontWeight: '700', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(192,112,112,0.35)',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ErrorHistory() {
  const { environment } = useEnvironment();
  const { errors, deleteErrors } = useErrors();
  const [search, setSearch]         = useState('');
  const [useRegex, setUseRegex]     = useState(false);
  const [severity, setSeverity]     = useState('all');
  const [platform, setPlatform]     = useState('all');
  const [sortKey, setSortKey]       = useState('timestamp');
  const [sortDir, setSortDir]       = useState('desc');
  const [regexError, setRegexError] = useState(false);

  // ── Selection state ──────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState(new Set());

  // ── Confirm modal ────────────────────────────────────────────────────────
  const [confirmModal, setConfirmModal] = useState(null); // { message, ids } | null

  const scrollRef = useRef(null);

  // ── Filter + sort ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (useRegex && search) {
      try { new RegExp(search); setRegexError(false); }
      catch { setRegexError(true); return []; }
    } else {
      setRegexError(false);
    }
    const f = filterErrors(errors, { search, useRegex, severity, platform, environment });
    return sortErrors(f, sortKey, sortDir);
  }, [errors, search, useRegex, severity, platform, environment, sortKey, sortDir]);

  // Reset scroll when filters change
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [filtered]);

  // ── Virtualizer ──────────────────────────────────────────────────────────
  const virtualizer = useVirtualizer({
    count:            filtered.length,
    getScrollElement: () => scrollRef.current,
    estimateSize:     () => ROW_HEIGHT,
    overscan:         OVERSCAN,
  });

  // ── Sort handler ─────────────────────────────────────────────────────────
  const handleSort = useCallback((key) => {
    setSortKey(k => {
      if (k === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return k; }
      setSortDir('asc');
      return key;
    });
  }, []);

  // ── Delete handler ───────────────────────────────────────────────────────
  /** Execute a confirmed delete */
  const doDelete = useCallback((ids) => {
    deleteErrors(ids);
    setSelectedIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.delete(id));
      return next;
    });
    setConfirmModal(null);
  }, [deleteErrors]);

  const askDelete = useCallback((ids, message) => {
    setConfirmModal({ ids, message });
  }, []);

  // ── Select helpers ───────────────────────────────────────────────────────
  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const allFilteredSelected =
    filtered.length > 0 && filtered.every(e => selectedIds.has(e.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filtered.forEach(e => next.delete(e.id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filtered.forEach(e => next.add(e.id));
        return next;
      });
    }
  };

  const selectedInView = filtered.filter(e => selectedIds.has(e.id));

  const totalRows   = virtualizer.getTotalSize();
  const virtualRows = virtualizer.getVirtualItems();

  return (
    <div className="fade-in">
      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={() => doDelete(confirmModal.ids)}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      <TopBar
        title="Error History"
        subtitle={`Virtual-scroll • ${filtered.length.toLocaleString()} / ${errors.length.toLocaleString()} rows`}
      />

      <div style={{ padding: '28px' }}>

        {/* ── Filters bar ─────────────────────────────────────────────── */}
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
                transition: 'all 0.2s', whiteSpace: 'nowrap',
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

          {/* Result count */}
          <div style={{ flexShrink: 0, paddingBottom: '2px' }}>
            <div style={{ fontSize: '13px', color: '#9b96c0', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#2d2b55' }}>
                {filtered.length.toLocaleString()}
              </span>{' '}
              <span style={{ fontSize: '12px' }}>results</span>
            </div>
          </div>

          {/* ── Bulk delete actions ──────────────────────────────────── */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginLeft: 'auto', flexShrink: 0 }}>
            {selectedInView.length > 0 && (
              <button
                id="delete-selected-btn"
                onClick={() =>
                  askDelete(
                    selectedInView.map(e => e.id),
                    `Permanently delete ${selectedInView.length.toLocaleString()} selected error${selectedInView.length > 1 ? 's' : ''}? This cannot be undone.`
                  )
                }
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(192,112,112,0.45)',
                  background: 'rgba(192,112,112,0.1)',
                  color: '#c07070',
                  fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                  transition: 'all 0.2s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(192,112,112,0.18)'; e.currentTarget.style.borderColor = 'rgba(192,112,112,0.7)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(192,112,112,0.1)'; e.currentTarget.style.borderColor = 'rgba(192,112,112,0.45)'; }}
              >
                <TrashIcon size={13} />
                Delete {selectedInView.length.toLocaleString()} selected
              </button>
            )}
            <button
              id="clear-all-btn"
              onClick={() =>
                askDelete(
                  errors.map(e => e.id),
                  `Permanently delete all ${errors.length.toLocaleString()} errors from history? This cannot be undone.`
                )
              }
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(192,112,112,0.3)',
                background: 'rgba(255,255,255,0.7)',
                color: '#aab6b9',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(192,112,112,0.08)'; e.currentTarget.style.color = '#c07070'; e.currentTarget.style.borderColor = 'rgba(192,112,112,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; e.currentTarget.style.color = '#aab6b9'; e.currentTarget.style.borderColor = 'rgba(192,112,112,0.3)'; }}
            >
              <TrashIcon size={13} />
              Clear All
            </button>
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
            {/* Select-all checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={toggleSelectAll}
                title="Select / deselect all visible rows"
                style={{ width: '14px', height: '14px', cursor: 'pointer', accentColor: '#7c5cbf' }}
              />
            </div>
            {COLUMNS.slice(1).map(col => (
              col.key === 'actions' ? <div key="actions" /> :
              <div
                key={col.key}
                onClick={() => col.key !== 'select' && handleSort(col.key)}
                style={{
                  fontSize: '11px', fontWeight: '700',
                  color: sortKey === col.key ? '#7c5cbf' : '#9b96c0',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  cursor: col.label ? 'pointer' : 'default', userSelect: 'none',
                  display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
                }}
              >
                {col.label}
                {col.label && <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />}
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
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>
                  {errors.length === 0 ? '🎉' : '🔍'}
                </div>
                <div>
                  {errors.length === 0
                    ? 'All errors have been cleared.'
                    : 'No errors match your filters'}
                </div>
              </div>
            ) : (
              <div style={{ height: `${totalRows}px`, width: '100%', position: 'relative' }}>
                {virtualRows.map(vRow => (
                  <VirtualRow
                    key={vRow.key}
                    error={filtered[vRow.index]}
                    selected={selectedIds.has(filtered[vRow.index].id)}
                    onSelect={toggleSelect}
                    onDelete={(ids) =>
                      askDelete(ids, `Permanently delete this error? This cannot be undone.`)
                    }
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

          {/* Footer */}
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
              {selectedInView.length > 0 && (
                <span style={{ marginLeft: '10px', color: '#7c5cbf', fontWeight: '600' }}>
                  · {selectedInView.length.toLocaleString()} selected
                </span>
              )}
              {' '}— scroll to see more
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
