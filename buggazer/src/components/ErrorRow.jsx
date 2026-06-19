import { formatTimestamp, formatRelative, getSeverityConfig } from '../utils/helpers';
import SeverityBadge from './SeverityBadge';

export default function ErrorRow({ error, isNew }) {
  const config = getSeverityConfig(error.severity);

  const envColor = {
    production: '#c07070',
    staging: '#8a8445',
    development: '#4a8a80',
  };

  return (
    <tr
      style={{
        borderLeft: isNew ? `3px solid ${config.dot}` : '3px solid transparent',
        transition: 'all 0.3s',
      }}
    >
      <td>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{
            fontSize: '13px', color: '#4a5d61', fontFamily: 'JetBrains Mono, monospace',
            maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {error.message}
          </div>
          <div style={{ fontSize: '11px', color: '#aab6b9' }}>
            {error.stack}
          </div>
        </div>
      </td>
      <td>
        <SeverityBadge severity={error.severity} />
      </td>
      <td>
        <span style={{
          fontSize: '12px', color: '#2e5060', fontWeight: '500',
          background: 'rgba(125,157,167,0.15)',
          padding: '2px 8px', borderRadius: '6px',
          border: '1px solid rgba(125,157,167,0.35)',
        }}>
          {error.service}
        </span>
      </td>
      <td>
        <span style={{ fontSize: '12px', color: '#7a8e92', textTransform: 'capitalize' }}>
          {error.platform}
        </span>
      </td>
      <td>
        <span style={{
          fontSize: '12px',
          color: envColor[error.environment] || '#7a8e92',
          textTransform: 'capitalize',
          fontWeight: '500',
        }}>
          {error.environment}
        </span>
      </td>
      <td>
        <div style={{ fontSize: '12px', color: '#7a8e92' }}>
          <div>{formatTimestamp(error.timestamp)}</div>
          <div style={{ fontSize: '11px', color: '#aab6b9' }}>{formatRelative(error.timestamp)}</div>
        </div>
      </td>
      <td>
        <span style={{ fontSize: '13px', fontWeight: '700', color: config.text }}>
          {error.count}
        </span>
      </td>
      <td>
        <span style={{
          fontSize: '11px',
          fontWeight: '600',
          color: error.resolved ? '#2e5f58' : '#7a3f3f',
          background: error.resolved ? 'rgba(178,211,204,0.25)' : 'rgba(217,176,176,0.25)',
          padding: '2px 8px', borderRadius: '6px',
          border: `1px solid ${error.resolved ? 'rgba(178,211,204,0.55)' : 'rgba(217,176,176,0.55)'}`,
        }}>
          {error.resolved ? 'Resolved' : 'Open'}
        </span>
      </td>
    </tr>
  );
}
