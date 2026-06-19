import { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area,
} from 'recharts';
import { useEnvironment } from '../context/EnvironmentContext';
import { trendData, severityData, initialErrors } from '../data/errors';
import { getErrorCounts } from '../utils/helpers';
import { ChartErrorBoundary } from './ChartErrorBoundary';
import TopBar from './TopBar';

// Palette: Mint #b2d3cc | Rose #d9b0b0 | Silver #cfcfd1 | Sage #bdb87a | Slate #7d9da7
const CHART_COLORS = {
  critical: '#d9b0b0',  // Dusty Rose
  warning:  '#bdb87a',  // Sage/Khaki
  info:     '#7d9da7',  // Slate Blue
  total:    '#b2d3cc',  // Mint
};

const CARD = {
  bg: 'rgba(255,255,255,0.88)',
  border: 'rgba(207,207,209,0.45)',
  shadow: '0 2px 14px rgba(207,207,209,0.25)',
  divider: 'rgba(207,207,209,0.35)',
};

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#3d4a4d' }}>{title}</h2>
      {subtitle && <p style={{ fontSize: '12px', color: '#aab6b9', marginTop: '3px' }}>{subtitle}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.98)',
      border: '1px solid rgba(207,207,209,0.6)',
      borderRadius: '10px',
      padding: '12px 16px',
      boxShadow: '0 4px 18px rgba(125,157,167,0.18)',
    }}>
      <div style={{ fontSize: '12px', color: '#aab6b9', marginBottom: '8px' }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ fontSize: '12px', color: '#4a5d61', textTransform: 'capitalize' }}>{p.name}:</span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text x={x} y={y} fill="#3d4a4d" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function Analytics() {
  const { environment } = useEnvironment();

  const filteredErrors = useMemo(() => {
    if (environment === 'all') return initialErrors;
    return initialErrors.filter(e => e.environment === environment);
  }, [environment]);

  const counts = useMemo(() => getErrorCounts(filteredErrors), [filteredErrors]);

  const serviceData = useMemo(() => {
    const map = {};
    filteredErrors.forEach(e => { map[e.service] = (map[e.service] || 0) + 1; });
    return Object.entries(map).map(([name, errors]) => ({ name, errors }))
      .sort((a, b) => b.errors - a.errors).slice(0, 8);
  }, [filteredErrors]);

  const summaryCards = [
    { label: 'Total Tracked', value: counts.total,    color: '#7d9da7', bg: 'rgba(125,157,167,0.12)', border: 'rgba(125,157,167,0.35)' },
    { label: 'Critical',      value: counts.critical, color: '#c07070', bg: 'rgba(217,176,176,0.15)', border: 'rgba(217,176,176,0.4)'  },
    { label: 'Warnings',      value: counts.warning,  color: '#8a8445', bg: 'rgba(189,184,122,0.15)', border: 'rgba(189,184,122,0.4)'  },
    { label: 'Info',          value: counts.info,     color: '#4a8a80', bg: 'rgba(178,211,204,0.15)', border: 'rgba(178,211,204,0.4)'  },
  ];

  // Bar chart palette — cycle through palette hues
  const barPalette = ['#d9b0b0','#bdb87a','#7d9da7','#b2d3cc','#cfcfd1','#f5d9d9','#b2d3cc','#7d9da7'];

  return (
    <div className="fade-in">
      <TopBar title="Analytics" subtitle="Error trends and distributions" />

      <div style={{ padding: '28px' }}>
        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
          {summaryCards.map(item => (
            <div key={item.label} style={{
              background: item.bg,
              border: `1px solid ${item.border}`,
              borderRadius: '12px',
              padding: '16px 18px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '11px', color: '#aab6b9', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
              <div style={{ fontSize: '30px', fontWeight: '800', color: item.color, marginTop: '6px' }}>
                {item.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Line chart */}
        <div style={{ background: CARD.bg, border: `1px solid ${CARD.border}`, borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: CARD.shadow }}>
          <SectionHeader title="Error Trend by Hour" subtitle="Error count breakdown over the last 18 hours" />
          <ChartErrorBoundary errorCounts={counts}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(207,207,209,0.3)" />
                <XAxis dataKey="hour" tick={{ fill: '#aab6b9', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'rgba(207,207,209,0.4)' }} />
                <YAxis tick={{ fill: '#aab6b9', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                  formatter={val => <span style={{ color: '#4a5d61', textTransform: 'capitalize' }}>{val}</span>}
                />
                <Line type="monotone" dataKey="critical" stroke={CHART_COLORS.critical} strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="warning"  stroke={CHART_COLORS.warning}  strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="info"     stroke={CHART_COLORS.info}     strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="total"    stroke={CHART_COLORS.total}    strokeWidth={2.5} dot={false} strokeDasharray="5 5" activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartErrorBoundary>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Pie chart */}
          <div style={{ background: CARD.bg, border: `1px solid ${CARD.border}`, borderRadius: '16px', padding: '24px', boxShadow: CARD.shadow }}>
            <SectionHeader title="Severity Distribution" subtitle="Proportion of errors by severity" />
            <ChartErrorBoundary errorCounts={counts}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <ResponsiveContainer width="60%" height={220}>
                  <PieChart>
                    <Pie
                      data={severityData} cx="50%" cy="50%"
                      innerRadius={55} outerRadius={90} paddingAngle={3}
                      dataKey="value" labelLine={false} label={<CustomPieLabel />}
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [val.toLocaleString(), name]}
                      contentStyle={{
                        background: 'rgba(255,255,255,0.98)',
                        border: '1px solid rgba(207,207,209,0.5)',
                        borderRadius: '8px', color: '#3d4a4d',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {severityData.map(item => (
                    <div key={item.name} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                          <span style={{ fontSize: '13px', color: '#4a5d61' }}>{item.name}</span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: item.color }}>{item.value.toLocaleString()}</span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(207,207,209,0.3)', borderRadius: '2px' }}>
                        <div style={{ height: '100%', width: `${(item.value / 1704) * 100}%`, background: item.color, borderRadius: '2px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ChartErrorBoundary>
          </div>

          {/* Bar chart */}
          <div style={{ background: CARD.bg, border: `1px solid ${CARD.border}`, borderRadius: '16px', padding: '24px', boxShadow: CARD.shadow }}>
            <SectionHeader title="Errors by Service" subtitle={`Top services in ${environment}`} />
            <ChartErrorBoundary errorCounts={counts}>
              {serviceData.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#aab6b9', padding: '60px 0' }}>No data for {environment}</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={serviceData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(207,207,209,0.3)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#aab6b9', fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#7a8e92', fontSize: 11 }} tickLine={false} axisLine={false} width={100} />
                    <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.98)', border: '1px solid rgba(207,207,209,0.5)', borderRadius: '8px', color: '#3d4a4d' }} />
                    <Bar dataKey="errors" radius={[0, 4, 4, 0]}>
                      {serviceData.map((_, i) => (
                        <Cell key={i} fill={barPalette[i % barPalette.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartErrorBoundary>
          </div>
        </div>

        {/* ── Crash Trend Tracker ── */}
        <CrashTrendTracker errors={filteredErrors} />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Crash Trend Tracker — pick an error, see its frequency plot
──────────────────────────────────────────────────────────── */
function generateTrendSeries(baseCount, seed) {
  // Build a deterministic-ish 12-hour frequency series from the error's count
  const hours = Array.from({ length: 12 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
  let v = Math.max(1, Math.round(baseCount * 0.3));
  const noise = (i) => Math.sin(i * seed * 2.3 + seed) * 0.4 + 1; // 0.6–1.4 multiplier
  return hours.map((hour, i) => {
    // Simulate a rising trend toward the end ("getting worse")
    const trend = 1 + i * 0.07 * (seed % 2 === 0 ? 1 : -0.5);
    v = Math.max(1, Math.round(v * noise(i) * trend));
    return { hour, count: Math.min(v, baseCount * 3) };
  });
}

function getTrendLabel(series) {
  if (series.length < 4) return { label: 'Stable', color: '#bdb87a', icon: '→' };
  const firstHalf = series.slice(0, 6).reduce((s, d) => s + d.count, 0) / 6;
  const secondHalf = series.slice(6).reduce((s, d) => s + d.count, 0) / 6;
  const ratio = secondHalf / (firstHalf || 1);
  if (ratio > 1.25) return { label: 'Worsening', color: '#d9b0b0', icon: '↑' };
  if (ratio < 0.8)  return { label: 'Improving', color: '#b2d3cc', icon: '↓' };
  return { label: 'Stable', color: '#bdb87a', icon: '→' };
}

const TrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.98)',
      border: '1px solid rgba(207,207,209,0.6)',
      borderRadius: '10px', padding: '10px 14px',
      boxShadow: '0 4px 18px rgba(125,157,167,0.18)',
    }}>
      <div style={{ fontSize: '11px', color: '#aab6b9', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '14px', fontWeight: '700', color: '#7d9da7' }}>
        {payload[0].value} occurrences
      </div>
    </div>
  );
};

function CrashTrendTracker({ errors }) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return errors
      .filter(e => e.message.toLowerCase().includes(q) || e.service.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, errors]);

  const selectedError = useMemo(
    () => errors.find(e => e.id === selectedId) || null,
    [selectedId, errors]
  );

  const trendSeries = useMemo(() => {
    if (!selectedError) return [];
    const seed = selectedError.id.charCodeAt(selectedError.id.length - 1);
    return generateTrendSeries(selectedError.count, seed);
  }, [selectedError]);

  const trend = useMemo(() => getTrendLabel(trendSeries), [trendSeries]);

  function selectError(err) {
    setSelectedId(err.id);
    setQuery(err.message.slice(0, 60));
    setShowSuggestions(false);
  }

  return (
    <div style={{
      background: CARD.bg,
      border: `1px solid ${CARD.border}`,
      borderRadius: '16px',
      padding: '24px',
      marginTop: '20px',
      boxShadow: CARD.shadow,
    }}>
      <SectionHeader
        title="Crash Trend Tracker"
        subtitle="Search for a specific error and immediately plot its occurrence frequency over time"
      />

      {/* Search input */}
      <div style={{ position: 'relative', maxWidth: '600px', marginBottom: '20px' }}>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7d9da7', pointerEvents: 'none' }}
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="crash-trend-search"
            type="text"
            value={query}
            placeholder="Type an error message or service name..."
            onChange={e => { setQuery(e.target.value); setShowSuggestions(true); setSelectedId(''); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '10px 14px 10px 36px',
              borderRadius: '10px',
              border: `1px solid ${selectedError ? 'rgba(125,157,167,0.6)' : 'rgba(207,207,209,0.5)'}`,
              background: 'rgba(255,255,255,0.9)',
              fontSize: '13px', color: '#3d4a4d',
              outline: 'none',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setSelectedId(''); }}
              style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#aab6b9', fontSize: '16px', lineHeight: 1,
              }}
            >×</button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
            background: 'rgba(255,255,255,0.98)',
            border: '1px solid rgba(207,207,209,0.5)',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(125,157,167,0.18)',
            overflow: 'hidden',
            marginTop: '4px',
          }}>
            {suggestions.map(err => (
              <button
                key={err.id}
                onMouseDown={() => selectError(err)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '10px 14px',
                  border: 'none', background: 'transparent',
                  cursor: 'pointer', textAlign: 'left',
                  borderBottom: '1px solid rgba(207,207,209,0.25)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(125,157,167,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                  background: err.severity === 'critical' ? '#d9b0b0' : err.severity === 'warning' ? '#bdb87a' : '#7d9da7',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', color: '#3d4a4d', fontFamily: 'JetBrains Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {err.message}
                  </div>
                  <div style={{ fontSize: '11px', color: '#7d9da7', marginTop: '1px' }}>{err.service} · ×{err.count}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart or empty state */}
      {selectedError ? (
        <div>
          {/* Selected error info bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '12px 16px',
            background: 'rgba(125,157,167,0.08)',
            border: '1px solid rgba(125,157,167,0.2)',
            borderRadius: '10px',
            marginBottom: '20px',
          }}>
            <span style={{
              width: '9px', height: '9px', borderRadius: '50%', flexShrink: 0,
              background: selectedError.severity === 'critical' ? '#d9b0b0' : selectedError.severity === 'warning' ? '#bdb87a' : '#7d9da7',
              boxShadow: `0 0 6px ${selectedError.severity === 'critical' ? 'rgba(217,176,176,0.7)' : 'rgba(125,157,167,0.6)'}`,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', color: '#3d4a4d', fontFamily: 'JetBrains Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedError.message}
              </div>
              <div style={{ fontSize: '11px', color: '#7d9da7', marginTop: '2px' }}>
                {selectedError.service} · {selectedError.platform} · {selectedError.environment}
              </div>
            </div>
            <div style={{ flexShrink: 0, textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#aab6b9', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Occurrences</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#7d9da7' }}>×{selectedError.count}</div>
            </div>
            {/* Trend badge */}
            <div style={{
              flexShrink: 0,
              padding: '6px 14px',
              borderRadius: '20px',
              background: `${trend.color}25`,
              border: `1px solid ${trend.color}60`,
              color: trend.color,
              fontSize: '13px', fontWeight: '700',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              <span style={{ fontSize: '16px' }}>{trend.icon}</span>
              {trend.label}
            </div>
          </div>

          {/* Area chart */}
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#aab6b9' }}>
            Occurrence frequency over the last 12 hours
          </div>
          <ChartErrorBoundary errorCounts={null}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendSeries} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7d9da7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7d9da7" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(207,207,209,0.3)" />
                <XAxis dataKey="hour" tick={{ fill: '#aab6b9', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'rgba(207,207,209,0.4)' }} />
                <YAxis tick={{ fill: '#aab6b9', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<TrendTooltip />} />
                <Area
                  type="monotone" dataKey="count"
                  stroke="#7d9da7" strokeWidth={2}
                  fill="url(#trendGrad)"
                  dot={false} activeDot={{ r: 5, fill: '#7d9da7', stroke: 'white', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartErrorBoundary>
        </div>
      ) : (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '48px 0',
          color: '#aab6b9',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cfcfd1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <div style={{ fontSize: '14px', color: '#aab6b9' }}>Search for an error above to see its trend</div>
          <div style={{ fontSize: '12px', color: '#cfcfd1', marginTop: '4px' }}>Type a keyword, error type, or service name</div>
        </div>
      )}
    </div>
  );
}
