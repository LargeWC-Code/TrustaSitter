import React from 'react';
import { config } from '../config/environment.js';

const EnvironmentDebug = () => {
  const isDevelopment = config.environment === 'development';
  
  if (!isDevelopment) {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded text-xs z-50">
      <div className="font-bold">DEV MODE</div>
      <div>API: {config.apiUrl}</div>
      <div>Env: {config.environment}</div>
    </div>
  );
};

export default EnvironmentDebug; 