import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EnvironmentProvider } from '../context/EnvironmentContext';
import { SettingsProvider } from '../context/SettingsContext';
import { ErrorsProvider } from '../context/ErrorsContext';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import LiveFeed from './LiveFeed';
import ErrorHistory from './ErrorHistory';
import Analytics from './Analytics';
import Alerts from './Alerts';
import Settings from './Settings';

export default function App() {
  return (
    <ErrorsProvider>
    <SettingsProvider>
      <EnvironmentProvider>
        <BrowserRouter>
          <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
            {/* Sidebar */}
            <Sidebar />

            {/* Main content */}
            <main style={{ marginLeft: '240px', flex: 1, minHeight: '100vh', overflow: 'hidden' }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/feed" element={<LiveFeed />} />
                <Route path="/history" element={<ErrorHistory />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/settings" element={<Settings />} />
                {/* 404 fallback */}
                <Route path="*" element={
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', height: '100vh', gap: '16px',
                  }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#7d9da7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4M12 16h.01" />
                    </svg>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>404 - Page Not Found</h1>
                    <p style={{ color: 'var(--text-muted)' }}>The page you're looking for doesn't exist.</p>
                    <a href="/" style={{ color: '#7d9da7', fontWeight: '600', textDecoration: 'none' }}>← Back to Dashboard</a>
                  </div>
                } />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </EnvironmentProvider>
    </SettingsProvider>
    </ErrorsProvider>
  );
}
