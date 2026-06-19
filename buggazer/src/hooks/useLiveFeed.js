import { useState, useEffect, useCallback } from 'react';
import { feedTemplates } from '../data/errors';

let errorIdCounter = 100;

function generateError(environment) {
  const template = feedTemplates[Math.floor(Math.random() * feedTemplates.length)];
  const platforms = ['web', 'nodejs', 'mobile'];
  errorIdCounter += 1;

  return {
    id: `live-${errorIdCounter}`,
    message: template.message,
    service: template.service,
    severity: template.severity,
    platform: platforms[Math.floor(Math.random() * platforms.length)],
    environment,
    timestamp: new Date().toISOString(),
    count: Math.floor(Math.random() * 50) + 1,
    stack: `at ${template.service}.handler (${template.service}.js:${Math.floor(Math.random() * 200) + 1})`,
    resolved: false,
    isLive: true,
  };
}

export function useLiveFeed(environment, isRunning = true, maxErrors = 50) {
  const [liveErrors, setLiveErrors] = useState([]);

  const addError = useCallback(() => {
    const newError = generateError(environment);
    setLiveErrors(prev => {
      const updated = [newError, ...prev];
      return updated.slice(0, maxErrors);
    });
  }, [environment, maxErrors]);

  useEffect(() => {
    if (!isRunning) return;

    // Add initial errors immediately
    addError();
    addError();
    addError();

    const interval = setInterval(() => {
      // Randomly add 1 or 2 errors at a time
      addError();
      if (Math.random() > 0.6) addError();
    }, 3000);

    return () => clearInterval(interval);
  }, [isRunning, addError]);

  const clearFeed = useCallback(() => setLiveErrors([]), []);

  return { liveErrors, clearFeed };
}
