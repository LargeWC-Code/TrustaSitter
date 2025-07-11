import React, { useState } from 'react';
import { api } from '../services/api';

const ConnectionTest = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setStatus('Testing connection...');
    
    try {
      const response = await api.get('/health');
      setStatus(`✅ Connection OK! Status: ${response.data.status}`);
      console.log('Health check response:', response.data);
    } catch (error) {
      console.error('Connection test error:', error);
      setStatus(`❌ Connection error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Connection Test</h3>
      <button 
        onClick={testConnection}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>
      {status && (
        <p className="mt-2 text-sm">{status}</p>
      )}
    </div>
  );
};

export default ConnectionTest; 