import { getSeverityConfig } from '../utils/helpers';

export default function SeverityBadge({ severity }) {
  const config = getSeverityConfig(severity);

  const dots = {
    critical: '●',
    warning: '◆',
    info: '▲',
  };

  return (
    <span className={`badge ${config.badge}`}>
      <span style={{ fontSize: '8px' }}>{dots[severity] || '●'}</span>
      {config.label}
    </span>
  );
}
