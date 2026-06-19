import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

const defaultSettings = {
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

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('buggazer-settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  // Apply theme + animations + compact to <html> whenever settings change
  useEffect(() => {
    const root = document.documentElement;

    if (settings.darkMode) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }

    if (settings.compactMode) {
      root.setAttribute('data-compact', 'true');
    } else {
      root.removeAttribute('data-compact');
    }

    if (!settings.animations) {
      root.setAttribute('data-no-anim', 'true');
    } else {
      root.removeAttribute('data-no-anim');
    }
  }, [settings.darkMode, settings.compactMode, settings.animations]);

  function updateSetting(key, value) {
    setSettings(s => ({ ...s, [key]: value }));
  }

  function saveSettings(newSettings) {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    try {
      localStorage.setItem('buggazer-settings', JSON.stringify(merged));
    } catch {}
  }

  function resetSettings() {
    setSettings(defaultSettings);
    try {
      localStorage.removeItem('buggazer-settings');
    } catch {}
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, saveSettings, resetSettings, defaultSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
