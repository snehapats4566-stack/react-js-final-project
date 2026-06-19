import { useState } from 'react';
import TopBar from './TopBar';
import { useSettings } from '../context/SettingsContext';

/* ── SVG icon components ── */

function IconDisplay() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function IconNotifications() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconData() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

const settingsSections = [
  { id: 'display',       label: 'Display',         icon: <IconDisplay /> },
  { id: 'notifications', label: 'Notifications',   icon: <IconNotifications /> },
  { id: 'data',          label: 'Data & Retention', icon: <IconData /> },
];

function SettingRow({ label, description, children }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '16px 0',
      borderBottom: '1px solid var(--border-setting)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-setting-label)' }}>{label}</div>
        {description && (
          <div style={{ fontSize: '12px', color: 'var(--text-setting-desc)', marginTop: '3px' }}>{description}</div>
        )}
      </div>
      <div style={{ marginLeft: '24px', flexShrink: 0 }}>
        {children}
      </div>
    </div>
  );
}

function Toggle({ value, onChange, id }) {
  return (
    <button
      id={id}
      onClick={() => onChange(!value)}
      aria-checked={value}
      role="switch"
      style={{
        width: '44px', height: '24px',
        borderRadius: '12px',
        background: value
          ? 'linear-gradient(135deg, #b2d3cc, #7d9da7)'
          : 'var(--bg-toggle-off)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.3s',
        flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute',
        top: '4px',
        left: value ? '23px' : '4px',
        width: '16px', height: '16px',
        borderRadius: '50%',
        background: 'white',
        transition: 'left 0.3s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

export default function Settings() {
  const { settings, updateSetting, saveSettings, resetSettings } = useSettings();
  const [activeSection, setActiveSection] = useState('display');
  const [saved, setSaved] = useState(false);

  // Local draft so unsaved changes don't apply immediately (except theme which is live preview)
  const [draft, setDraft] = useState({ ...settings });

  function update(key, value) {
    setDraft(d => ({ ...d, [key]: value }));
    // Live-apply theme-affecting settings for instant preview
    if (key === 'darkMode' || key === 'animations' || key === 'compactMode') {
      updateSetting(key, value);
    }
  }

  function handleSave() {
    saveSettings(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    const defaults = {
      refreshInterval: '3',
      maxFeedItems: '50',
      autoScroll: true,
      showStackTrace: true,
      compactMode: false,
      darkMode: false,
      animations: true,
      timestampFormat: 'relative',
      emailNotifications: true,
      slackNotifications: false,
      browserNotifications: true,
      soundAlerts: false,
      retentionDays: '30',
      autoArchive: true,
      exportFormat: 'json',
      sampleRate: '100',
    };
    setDraft(defaults);
    resetSettings();
  }

  function handleExport() {
    const dataStr = JSON.stringify({ settings: draft, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([dataStr], { type: `application/${draft.exportFormat === 'json' ? 'json' : 'octet-stream'}` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buggazer-export.${draft.exportFormat}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fade-in">
      <TopBar title="Settings" subtitle="Configure BugGazer preferences" />

      <div style={{ padding: '28px' }}>
        {saved && (
          <div style={{
            position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
            background: 'rgba(34,197,94,0.12)',
            border: '1px solid rgba(34,197,94,0.35)',
            borderRadius: '10px', padding: '12px 18px',
            color: '#22c55e', fontSize: '14px', fontWeight: '600',
            display: 'flex', alignItems: 'center', gap: '8px',
            animation: 'slideInRight 0.3s ease',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            Settings saved successfully!
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px' }}>
          {/* Sidebar tabs */}
          <div style={{
            background: 'var(--bg-setting-sidebar)',
            border: '1px solid var(--border-setting)',
            borderRadius: '14px',
            padding: '8px',
            height: 'fit-content',
          }}>
            {settingsSections.map(sec => (
              <button
                key={sec.id}
                id={`settings-${sec.id}`}
                onClick={() => setActiveSection(sec.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: activeSection === sec.id ? '1px solid var(--sidebar-active-border)' : '1px solid transparent',
                  background: activeSection === sec.id ? 'var(--bg-active)' : 'transparent',
                  color: activeSection === sec.id ? 'var(--text-sidebar-active)' : 'var(--text-muted)',
                  fontSize: '13px', fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginBottom: '2px',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ opacity: activeSection === sec.id ? 1 : 0.6 }}>{sec.icon}</span>
                {sec.label}
              </button>
            ))}
          </div>

          {/* Content panel */}
          <div style={{
            background: 'var(--bg-setting-panel)',
            border: '1px solid var(--border-setting)',
            borderRadius: '14px',
            padding: '24px',
          }}>


            {/* Display */}
            {activeSection === 'display' && (
              <div className="fade-in">
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '4px' }}>Display Settings</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>Appearance and UI preferences</p>

                <SettingRow
                  label={
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {draft.darkMode ? <IconMoon /> : <IconSun />}
                      Dark Mode
                    </span>
                  }
                  description="Switch between light and dark color theme — applies instantly"
                >
                  <Toggle id="dark-mode" value={draft.darkMode} onChange={v => update('darkMode', v)} />
                </SettingRow>

                <SettingRow label="Enable Animations" description="Smooth transitions and micro-animations — applies instantly">
                  <Toggle id="animations" value={draft.animations} onChange={v => update('animations', v)} />
                </SettingRow>

                <SettingRow label="Compact Mode" description="Reduce padding and spacing for more data density — applies instantly">
                  <Toggle id="compact-mode" value={draft.compactMode} onChange={v => update('compactMode', v)} />
                </SettingRow>

                <SettingRow label="Timestamp Format" description="How timestamps are displayed throughout the app">
                  <select value={draft.timestampFormat} onChange={e => update('timestampFormat', e.target.value)} className="input-field" style={{ width: '170px' }} id="timestamp-format">
                    <option value="relative">Relative (3m ago)</option>
                    <option value="absolute">Absolute (Jun 11 10:05)</option>
                    <option value="iso">ISO 8601</option>
                  </select>
                </SettingRow>
              </div>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <div className="fade-in">
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '4px' }}>Notification Settings</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>Configure how you receive error notifications</p>

                <SettingRow label="Email Notifications" description="Receive critical error alerts via email">
                  <Toggle id="email-notif" value={draft.emailNotifications} onChange={v => update('emailNotifications', v)} />
                </SettingRow>

                <SettingRow label="Slack Notifications" description="Send alerts to your Slack workspace">
                  <Toggle id="slack-notif" value={draft.slackNotifications} onChange={v => update('slackNotifications', v)} />
                </SettingRow>

                <SettingRow label="Browser Notifications" description="Show desktop push notifications for critical errors">
                  <Toggle id="browser-notif" value={draft.browserNotifications} onChange={v => update('browserNotifications', v)} />
                </SettingRow>

                <SettingRow label="Sound Alerts" description="Play a sound when a critical error is detected">
                  <Toggle id="sound-alerts" value={draft.soundAlerts} onChange={v => update('soundAlerts', v)} />
                </SettingRow>
              </div>
            )}

            {/* Data */}
            {activeSection === 'data' && (
              <div className="fade-in">
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '4px' }}>Data & Retention</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>Manage error data storage and exports</p>

                <SettingRow label="Data Retention Period" description="How long to keep error logs">
                  <select value={draft.retentionDays} onChange={e => update('retentionDays', e.target.value)} className="input-field" style={{ width: '150px' }} id="retention-days">
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="365">1 year</option>
                  </select>
                </SettingRow>

                <SettingRow label="Auto-archive Resolved" description="Automatically archive resolved errors after retention period">
                  <Toggle id="auto-archive" value={draft.autoArchive} onChange={v => update('autoArchive', v)} />
                </SettingRow>

                <SettingRow label="Export Format" description="Default format for exporting error data">
                  <select value={draft.exportFormat} onChange={e => update('exportFormat', e.target.value)} className="input-field" style={{ width: '130px' }} id="export-format">
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="xlsx">Excel</option>
                  </select>
                </SettingRow>

                <SettingRow label="Export Data" description="Download all error logs in selected format">
                  <button className="btn-secondary" style={{ fontSize: '12px', padding: '7px 14px' }} id="export-btn" onClick={handleExport}>
                    <IconDownload />
                    Export Now
                  </button>
                </SettingRow>
              </div>
            )}

            {/* Save buttons */}
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-setting)', display: 'flex', gap: '10px' }}>
              <button className="btn-primary" onClick={handleSave} id="save-settings-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                </svg>
                Save Changes
              </button>
              <button className="btn-secondary" onClick={handleReset} id="reset-settings-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
                </svg>
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
