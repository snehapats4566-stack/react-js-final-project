import { useState } from 'react';
import { alertPresets } from '../data/errors';
import TopBar from './TopBar';

const channelIcons = {
  slack: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/>
      <path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
      <path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"/>
      <path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/>
      <path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"/>
      <path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>
      <path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z"/>
      <path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z"/>
    </svg>
  ),
  email: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  pagerduty: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  webhook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  teams: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

function AlertCard({ alert, onToggle, onDelete }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.85)',
      border: `1px solid ${alert.active ? 'rgba(196,184,245,0.5)' : 'rgba(196,184,245,0.25)'}`,
      borderRadius: '14px',
      padding: '18px 20px',
      transition: 'all 0.3s',
      boxShadow: alert.active ? '0 4px 16px rgba(196,184,245,0.2)' : '0 2px 10px rgba(196,184,245,0.1)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>{channelIcons[alert.channel] || (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
            )}</span>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#2d2b55' }}>{alert.name}</h3>
            <span className={`badge ${alert.severity === 'critical' ? 'badge-critical' : 'badge-warning'}`}>
              {alert.severity}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#9b96c0' }}>
            <span>Threshold: <strong style={{ color: '#3d3570' }}>{alert.threshold} errors</strong></span>
            <span>Freq: <strong style={{ color: '#3d3570' }}>{alert.frequency}</strong></span>
            <span>Channel: <strong style={{ color: '#3d3570', textTransform: 'capitalize' }}>{alert.channel}</strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Toggle */}
          <button
            onClick={() => onToggle(alert.id)}
            style={{
              width: '42px', height: '22px',
              borderRadius: '11px',
              background: alert.active
                ? 'linear-gradient(135deg, #b39def, #a7c4ff)'
                : 'rgba(196,184,245,0.3)',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.3s',
              flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute',
              top: '3px',
              left: alert.active ? '22px' : '3px',
              width: '16px', height: '16px',
              borderRadius: '50%',
              background: 'white',
              transition: 'left 0.3s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }} />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(alert.id)}
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(252,196,196,0.5)',
              background: 'rgba(252,196,196,0.2)',
              color: '#c0392b',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(252,196,196,0.35)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(252,196,196,0.2)'}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Status bar */}
        <div style={{
          marginTop: '14px', paddingTop: '12px',
          borderTop: '1px solid rgba(196,184,245,0.25)',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: alert.active ? '#6dbf8e' : '#9b96c0',
            boxShadow: alert.active ? '0 0 6px rgba(109,191,142,0.5)' : 'none',
            animation: alert.active ? 'pulse 2s ease infinite' : 'none',
          }} />
          <span style={{ fontSize: '12px', color: alert.active ? '#1a7a4e' : '#9b96c0', fontWeight: '500' }}>
          {alert.active ? 'Active — monitoring for threshold breaches' : 'Disabled — not currently monitoring'}
        </span>
      </div>
    </div>
  );
}

export default function Alerts() {
  const [alerts, setAlerts] = useState(alertPresets);
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: '',
    threshold: 50,
    frequency: '5min',
    channel: 'slack',
    severity: 'critical',
  });

  function handleToggle(id) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  }

  function handleDelete(id) {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  function handleSave() {
    if (!form.name.trim()) return;
    const newAlert = {
      id: `alert-${Date.now()}`,
      ...form,
      threshold: Number(form.threshold),
      active: true,
    };
    setAlerts(prev => [newAlert, ...prev]);
    setForm({ name: '', threshold: 50, frequency: '5min', channel: 'slack', severity: 'critical' });
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="fade-in">
      <TopBar title="Alert Settings" subtitle="Configure error alert thresholds and notifications" />

      <div style={{ padding: '28px' }}>
        {/* Success toast */}
        {saved && (
          <div style={{
            position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
            background: 'rgba(187,237,213,0.3)',
            border: '1px solid rgba(187,237,213,0.7)',
            borderRadius: '10px', padding: '12px 18px',
            color: '#1a7a4e', fontSize: '14px', fontWeight: '600',
            display: 'flex', alignItems: 'center', gap: '8px',
            animation: 'slideInRight 0.3s ease',
            boxShadow: '0 8px 24px rgba(196,184,245,0.3)',
          }}>
            ✓ Alert saved successfully!
          </div>
        )}

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#2d2b55' }}>Active Alerts</h2>
            <p style={{ fontSize: '12px', color: '#9b96c0', marginTop: '2px' }}>
              {alerts.filter(a => a.active).length} of {alerts.length} alerts active
            </p>
          </div>
          <button
            id="create-alert-btn"
            className="btn-primary"
            onClick={() => setShowForm(s => !s)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {showForm ? 'Cancel' : 'Create Alert'}
          </button>
        </div>

        {/* Create Alert Form */}
        {showForm && (
          <div className="slide-in-up" style={{
            background: 'rgba(255,255,255,0.92)',
            border: '1px solid rgba(196,184,245,0.5)',
            borderRadius: '16px',
            padding: '22px',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(196,184,245,0.2)',
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#2d2b55', marginBottom: '18px' }}>
              New Alert Configuration
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {/* Alert name */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '11px', color: '#9b96c0', display: 'block', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Alert Name *
                </label>
                <input
                  id="alert-name"
                  type="text"
                  placeholder="e.g. Critical Error Spike"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input-field"
                />
              </div>

              {/* Threshold */}
              <div>
                <label style={{ fontSize: '11px', color: '#9b96c0', display: 'block', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Alert Threshold (errors)
                </label>
                <input
                  id="alert-threshold"
                  type="number"
                  min="1"
                  max="10000"
                  value={form.threshold}
                  onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))}
                  className="input-field"
                />
              </div>

              {/* Severity */}
              <div>
                <label style={{ fontSize: '11px', color: '#9b96c0', display: 'block', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Severity
                </label>
                <select
                  id="alert-severity"
                  value={form.severity}
                  onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}
                  className="input-field"
                >
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>
              </div>

              {/* Frequency */}
              <div>
                <label style={{ fontSize: '11px', color: '#9b96c0', display: 'block', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Alert Frequency
                </label>
                <select
                  id="alert-frequency"
                  value={form.frequency}
                  onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
                  className="input-field"
                >
                  <option value="1min">Every 1 minute</option>
                  <option value="5min">Every 5 minutes</option>
                  <option value="15min">Every 15 minutes</option>
                  <option value="30min">Every 30 minutes</option>
                  <option value="1hour">Every hour</option>
                </select>
              </div>

              {/* Channel */}
              <div>
                <label style={{ fontSize: '11px', color: '#9b96c0', display: 'block', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Alert Channel
                </label>
                <select
                  id="alert-channel"
                  value={form.channel}
                  onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}
                  className="input-field"
                >
                  <option value="slack">Slack</option>
                  <option value="email">Email</option>
                  <option value="pagerduty">PagerDuty</option>
                  <option value="webhook">Webhook</option>
                  <option value="teams">MS Teams</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '18px', display: 'flex', gap: '10px' }}>
              <button
                id="save-alert-btn"
                className="btn-primary"
                onClick={handleSave}
                disabled={!form.name.trim()}
                style={{ opacity: form.name.trim() ? 1 : 0.5 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                </svg>
                Save Alert
              </button>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Alert list */}
        {alerts.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px',
            background: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(196,184,245,0.3)',
            borderRadius: '16px',
          }}>
            <div style={{ marginBottom: '12px', color: 'var(--text-faint)', display: 'flex', justifyContent: 'center' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div style={{ color: '#9b96c0', fontSize: '14px' }}>No alerts configured. Create one above.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
