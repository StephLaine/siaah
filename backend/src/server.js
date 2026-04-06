// server.js - Siaah Backend
const app = require('./app');
const http = require('http');

const PORT = process.env.PORT || 5001;
const server = http.createServer(app);

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please kill the process using it or choose another port.`);
  } else {
    console.error(e);
  }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});