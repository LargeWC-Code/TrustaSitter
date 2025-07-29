import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Importing global styles
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { WebSocketProvider } from './context/WebSocketContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <WebSocketProvider>
          <App />
        </WebSocketProvider>
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>
);
