// Palette:
// Mint: #b2d3cc | Dusty Rose: #d9b0b0 | Blush: #f5d9d9
// Silver: #cfcfd1 | Sage: #bdb87a | Slate: #7d9da7

export default function StatCard({ title, value, subtitle, icon, color, glow, trend }) {
  const glowMap = {
    red:    '0 4px 20px rgba(217,176,176,0.4)',
    yellow: '0 4px 20px rgba(189,184,122,0.35)',
    blue:   '0 4px 20px rgba(125,157,167,0.35)',
    purple: '0 4px 20px rgba(207,207,209,0.4)',
    mint:   '0 4px 20px rgba(178,211,204,0.4)',
    green:  '0 4px 20px rgba(178,211,204,0.4)',
  };

  const colorMap = {
    // Critical 
    red:    { text: '#7a3f3f', bg: 'rgba(217,176,176,0.2)', border: 'rgba(217,176,176,0.5)', icon: '#d9b0b0' },
    // Warning 
    yellow: { text: '#5c5730', bg: 'rgba(189,184,122,0.18)', border: 'rgba(189,184,122,0.45)', icon: '#bdb87a' },
    // Info / Active
    blue:   { text: '#2e5060', bg: 'rgba(125,157,167,0.15)', border: 'rgba(125,157,167,0.4)', icon: '#7d9da7' },
    // Neutral
    purple: { text: '#4a6368', bg: 'rgba(207,207,209,0.2)', border: 'rgba(207,207,209,0.5)', icon: '#cfcfd1' },
    // Success 
    green:  { text: '#2e5f58', bg: 'rgba(178,211,204,0.2)', border: 'rgba(178,211,204,0.5)', icon: '#b2d3cc' },
    mint:   { text: '#2e5f58', bg: 'rgba(178,211,204,0.2)', border: 'rgba(178,211,204,0.5)', icon: '#b2d3cc' },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      className="stat-card"
      style={{
        background: 'rgba(255, 255, 255, 0.88)',
        border: `1px solid ${c.border}`,
        borderRadius: '16px',
        padding: '22px',
        boxShadow: glowMap[glow || color] || '0 2px 14px rgba(207,207,209,0.25)',
        backdropFilter: 'blur(8px)',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', color: '#aab6b9', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            {title}
          </div>
          <div style={{ fontSize: '34px', fontWeight: '800', color: '#3d4a4d', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {subtitle && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#aab6b9' }}>
              {subtitle}
            </div>
          )}
          {trend !== undefined && (
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{
                fontSize: '12px', fontWeight: '600',
                color: trend > 0 ? '#7a3f3f' : '#2e5f58',
              }}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
              <span style={{ fontSize: '11px', color: '#aab6b9' }}>vs last hour</span>
            </div>
          )}
        </div>
        <div style={{
          width: '46px', height: '46px',
          background: c.bg,
          border: `1px solid ${c.border}`,
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: c.text,
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: '16px', height: '3px', background: 'rgba(207,207,209,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, (value / 1000) * 100 || 60)}%`,
          background: `linear-gradient(90deg, ${c.icon}80, ${c.icon})`,
          borderRadius: '2px',
          transition: 'width 1s ease',
        }} />
      </div>
    </div>
  );
}
