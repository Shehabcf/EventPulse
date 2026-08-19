require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const app = require('./app');
const initSocket = require('./sockets/index');

const PORT = process.env.PORT || 5000;

connectDB();

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: '*' },
});

// make io reachable from controllers via req.app.get('io')
app.set('io', io);

initSocket(io);

httpServer.listen(PORT, () => {
  console.log(`EventPulse API running on port ${PORT}`);
});

module.exports = httpServer;
