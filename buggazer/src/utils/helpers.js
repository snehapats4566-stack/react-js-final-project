// Utility functions for BugGazer

/**
 * Format ISO timestamp into readable date/time
 */
export function formatTimestamp(iso) {
  const date = new Date(iso);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * Format relative time (e.g., "3 seconds ago")
 */
export function formatRelative(iso) {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/**
 * Get severity color classes
 */
export function getSeverityConfig(severity) {
  const configs = {
    // Critical → Dusty Rose (#d9b0b0)
    critical: {
      badge: 'badge-critical',
      dot: '#d9b0b0',
      bg: 'rgba(217, 176, 176, 0.2)',
      border: 'rgba(217, 176, 176, 0.5)',
      text: '#7a3f3f',
      label: 'Critical',
    },
    // Warning → Sage/Khaki (#bdb87a)
    warning: {
      badge: 'badge-warning',
      dot: '#bdb87a',
      bg: 'rgba(189, 184, 122, 0.18)',
      border: 'rgba(189, 184, 122, 0.45)',
      text: '#5c5730',
      label: 'Warning',
    },
    // Info → Slate Blue (#7d9da7)
    info: {
      badge: 'badge-info',
      dot: '#7d9da7',
      bg: 'rgba(125, 157, 167, 0.15)',
      border: 'rgba(125, 157, 167, 0.4)',
      text: '#2e5060',
      label: 'Info',
    },
  };
  return configs[severity] || configs.info;
}

/**
 * Test if a string matches a regex pattern safely
 */
export function matchesRegex(text, pattern) {
  try {
    const regex = new RegExp(pattern, 'i');
    return regex.test(text);
  } catch {
    return false;
  }
}

/**
 * Filter errors based on search, severity, platform, environment
 */
export function filterErrors(errors, { search, useRegex, severity, platform, environment }) {
  return errors.filter(err => {
    // Environment filter
    if (environment && environment !== 'all' && err.environment !== environment) return false;

    // Severity filter
    if (severity && severity !== 'all' && err.severity !== severity) return false;

    // Platform filter
    if (platform && platform !== 'all' && err.platform !== platform) return false;

    // Search filter
    if (search) {
      const term = search.toLowerCase();
      const inMessage = useRegex
        ? matchesRegex(err.message, search) || matchesRegex(err.service, search)
        : err.message.toLowerCase().includes(term) || err.service.toLowerCase().includes(term);
      if (!inMessage) return false;
    }

    return true;
  });
}

/**
 * Sort errors by a given key
 */
export function sortErrors(errors, sortKey, sortDir) {
  return [...errors].sort((a, b) => {
    let aVal = a[sortKey];
    let bVal = b[sortKey];

    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Get counts by severity from an error list
 */
export function getErrorCounts(errors) {
  return errors.reduce(
    (acc, err) => {
      acc.total += 1;
      acc[err.severity] = (acc[err.severity] || 0) + 1;
      return acc;
    },
    { total: 0, critical: 0, warning: 0, info: 0 }
  );
}
