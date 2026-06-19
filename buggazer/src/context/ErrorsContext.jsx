import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initialErrors, generateLargeDataset, feedTemplates } from '../data/errors';

const LS_KEY = 'buggazer_deleted_ids';

// ── Seed built once at module level ──────────────────────────────────────────
const SEED_ERRORS = [...initialErrors, ...generateLargeDataset(10000)];

// ── localStorage helpers ──────────────────────────────────────────────────────
function loadDeletedIds() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveDeletedIds(idSet) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...idSet]));
  } catch { /* quota – silently ignore */ }
}

// Apply persisted deletions before first render
const persistedDeleted = loadDeletedIds();
const INITIAL_ERRORS = persistedDeleted.size
  ? SEED_ERRORS.filter(e => !persistedDeleted.has(e.id))
  : SEED_ERRORS;

// ── Live error generator (shared counter so IDs are always unique) ──────────
let liveCounter = 200000;
const PLATFORMS = ['web', 'nodejs', 'mobile'];
const ENVS      = ['production', 'staging', 'development'];

function generateLiveError() {
  liveCounter += 1;
  const tpl = feedTemplates[Math.floor(Math.random() * feedTemplates.length)];
  return {
    id:          `live-${liveCounter}`,
    message:     tpl.message,
    service:     tpl.service,
    severity:    tpl.severity,
    platform:    PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)],
    environment: ENVS[Math.floor(Math.random() * ENVS.length)],
    timestamp:   new Date().toISOString(),
    count:       Math.floor(Math.random() * 50) + 1,
    resolved:    false,
    isLive:      true,
  };
}

// ── Context ───────────────────────────────────────────────────────────────────
const ErrorsContext = createContext(null);

export function ErrorsProvider({ children }) {
  const [errors, setErrors] = useState(INITIAL_ERRORS);

  // ── Live feed: inject new errors every 3 s ─────────────────────────────
  useEffect(() => {
    // seed 3 live errors right away so the list is never empty after a clear
    const seed = [generateLiveError(), generateLiveError(), generateLiveError()];
    setErrors(prev => [...seed, ...prev]);

    const interval = setInterval(() => {
      const batch = [generateLiveError()];
      if (Math.random() > 0.6) batch.push(generateLiveError());
      setErrors(prev => [...batch, ...prev]);
    }, 3000);

    return () => clearInterval(interval);
  }, []); // runs once for the lifetime of the app

  // ── Delete and persist ─────────────────────────────────────────────────
  const deleteErrors = useCallback((ids) => {
    const incoming = new Set(ids);
    const current  = loadDeletedIds();
    ids.forEach(id => current.add(id));
    saveDeletedIds(current);
    setErrors(prev => prev.filter(e => !incoming.has(e.id)));
  }, []);

  return (
    <ErrorsContext.Provider value={{ errors, deleteErrors }}>
      {children}
    </ErrorsContext.Provider>
  );
}

export function useErrors() {
  const ctx = useContext(ErrorsContext);
  if (!ctx) throw new Error('useErrors must be used inside <ErrorsProvider>');
  return ctx;
}
