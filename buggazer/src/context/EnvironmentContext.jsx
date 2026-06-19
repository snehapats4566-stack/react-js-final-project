import { createContext, useContext, useState } from 'react';

// Environment Context
const EnvironmentContext = createContext(null);

export function EnvironmentProvider({ children }) {
  const [environment, setEnvironment] = useState('production');

  const environments = [
    { value: 'production', label: 'Production', color: '#c07070', dot: 'bg-rose-400' },
    { value: 'staging', label: 'Staging', color: '#8a8445', dot: 'bg-amber-400' },
    { value: 'development', label: 'Development', color: '#4a8a80', dot: 'bg-teal-400' },
  ];

  const currentEnv = environments.find(e => e.value === environment);

  return (
    <EnvironmentContext.Provider value={{ environment, setEnvironment, environments, currentEnv }}>
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironment() {
  const ctx = useContext(EnvironmentContext);
  if (!ctx) throw new Error('useEnvironment must be used within EnvironmentProvider');
  return ctx;
}
