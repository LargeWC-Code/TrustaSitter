const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const serverConfig = require('./config/server');

// Create Express application
const app = express();

// CORS configuration
app.use(cors(serverConfig.cors));

// Parse JSON
app.use(express.json());

// Static file service
app.use(express.static('public'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    protocol: req.protocol,
    ssl: req.secure
  });
});

// Other API routes...
// (You can import your other routes here)

// Check if SSL certificate files exist
function checkSSLCertificates() {
  const certPath = path.join(__dirname, 'ssl', 'fullchain.pem');
  const keyPath = path.join(__dirname, 'ssl', 'privkey.pem');
  
  return {
    exists: fs.existsSync(certPath) && fs.existsSync(keyPath),
    cert: certPath,
    key: keyPath
  };
}

// Start server
function startServer() {
  const ssl = checkSSLCertificates();
  
  if (ssl.exists) {
    console.log('🔒 SSL certificates found, starting HTTPS server...');
    
    // Read SSL certificates
    const httpsOptions = {
      cert: fs.readFileSync(ssl.cert),
      key: fs.readFileSync(ssl.key)
    };
    
    // Create HTTPS server
    const httpsServer = https.createServer(httpsOptions, app);
    
    // Create Socket.IO server
    const io = new Server(httpsServer, {
      cors: serverConfig.socketIO.cors
    });
    
    // Socket.IO event handling
    io.on('connection', (socket) => {
      console.log('🔌 Client connected via HTTPS');
      
      socket.on('authenticate', (token) => {
        // Handle authentication
        console.log('🔐 Authentication via HTTPS');
      });
      
      socket.on('disconnect', () => {
        console.log('🔌 Client disconnected from HTTPS');
      });
    });
    
    // Start HTTPS server
    httpsServer.listen(serverConfig.port, () => {
      console.log(`🚀 HTTPS Server running on port ${serverConfig.port}`);
      console.log(`🔒 SSL enabled`);
      console.log(`🌐 Access: https://20.58.138.202:${serverConfig.port}`);
    });
    
    return httpsServer;
    
  } else {
    console.log('🔓 No SSL certificates found, starting HTTP server...');
    
    // Create HTTP server
    const httpServer = http.createServer(app);
    
    // Create Socket.IO server
    const io = new Server(httpServer, {
      cors: serverConfig.socketIO.cors
    });
    
    // Socket.IO event handling
    io.on('connection', (socket) => {
      console.log('🔌 Client connected via HTTP');
      
      socket.on('authenticate', (token) => {
        // Handle authentication
        console.log('🔐 Authentication via HTTP');
      });
      
      socket.on('disconnect', () => {
        console.log('🔌 Client disconnected from HTTP');
      });
    });
    
    // Start HTTP server
    httpServer.listen(serverConfig.port, () => {
      console.log(`🚀 HTTP Server running on port ${serverConfig.port}`);
      console.log(`🔓 SSL disabled`);
      console.log(`🌐 Access: http://20.58.138.202:${serverConfig.port}`);
    });
    
    return httpServer;
  }
}

// Start the server
const server = startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
}); 