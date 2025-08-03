import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const StressTest = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);

  // Check status on component mount
  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const response = await api.get('/stress-test/status');
      setStatus(response.data);
      setIsRunning(response.data.isRunning);
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const startTest = async () => {
    try {
      setLogs(prev => [...prev, `🚀 Starting 6-minute stress test...`]);
      
      const response = await api.post('/stress-test/start');
      
      setLogs(prev => [...prev, `✅ ${response.data.message}`]);
      setIsRunning(true);
      setStatus(response.data.status);
      
      // Start monitoring
      monitorTest();
    } catch (error) {
      setLogs(prev => [...prev, `❌ Error: ${error.response?.data?.error || error.message}`]);
    }
  };

  const stopTest = async () => {
    try {
      setLogs(prev => [...prev, `⏹️ Stopping stress test...`]);
      
      const response = await api.post('/stress-test/stop');
      
      setLogs(prev => [...prev, `✅ ${response.data.message}`]);
      setIsRunning(false);
      setStatus(response.data.status);
    } catch (error) {
      setLogs(prev => [...prev, `❌ Error: ${error.response?.data?.error || error.message}`]);
    }
  };

  const monitorTest = () => {
    const interval = setInterval(async () => {
      try {
        const response = await api.get('/stress-test/status');
        setStatus(response.data.status);
        
        if (!response.data.isRunning) {
          setIsRunning(false);
          setLogs(prev => [...prev, `✅ Stress test completed!`]);
          clearInterval(interval);
        } else {
          const elapsed = response.data.status.elapsed;
          const remaining = response.data.status.testDuration - elapsed;
          setLogs(prev => [...prev, `📊 Elapsed: ${elapsed.toFixed(1)}s, Remaining: ${remaining.toFixed(1)}s`]);
        }
      } catch (error) {
        console.error('Error monitoring test:', error);
      }
    }, 10000); // Update every 10 seconds
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🚀 VMSS Stress Test</h2>
      
      {/* Test Controls */}
      <div className="mb-6">
        <button
          onClick={startTest}
          disabled={isRunning}
          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-lg transition-colors text-lg"
        >
          🚀 Start 6-Minute Stress Test
        </button>
      </div>

      {/* Stop Button */}
      {isRunning && (
        <div className="mb-6">
          <button
            onClick={stopTest}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition-colors"
          >
            ⏹️ Stop Test
          </button>
        </div>
      )}

      {/* Status Display */}
      {status && (
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">📊 Test Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                isRunning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {isRunning ? 'Running' : 'Idle'}
              </span>
            </div>
            {status.startTime && (
              <div>
                <span className="font-medium">Start Time:</span>
                <span className="ml-2">{new Date(status.startTime).toLocaleTimeString()}</span>
              </div>
            )}
            {status.elapsed > 0 && (
              <div>
                <span className="font-medium">Elapsed:</span>
                <span className="ml-2">{status.elapsed.toFixed(1)}s</span>
              </div>
            )}
            {status.testDuration > 0 && (
              <div>
                <span className="font-medium">Duration:</span>
                <span className="ml-2">{status.testDuration.toFixed(1)}s</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logs */}
      <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">📝 Test Logs</h3>
          <button
            onClick={clearLogs}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs"
          >
            Clear
          </button>
        </div>
        {logs.length === 0 ? (
          <div className="text-gray-500">No logs yet. Start a test to see logs here.</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">
              <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
            </div>
          ))
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">📋 Instructions</h3>
        <ul className="text-sm space-y-1">
          <li>• <strong>6-Minute Test:</strong> Heavy CPU stress for exactly 6 minutes</li>
          <li>• Monitor your VMSS in Azure Portal to see auto-scaling in action</li>
          <li>• CPU usage should exceed 50% to trigger scaling</li>
          <li>• Test can only be triggered from this frontend interface</li>
          <li>• No automatic startup - manual trigger only</li>
        </ul>
      </div>
    </div>
  );
};

export default StressTest; 