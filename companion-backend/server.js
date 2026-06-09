import app from './src/app.js';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './src/config/db.js';
import { setupSocket } from './src/sockets/socket.js';
import logger from './src/utils/logger.js';

// Connect to MongoDB
connectDB();

const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setupSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Force restart for new env variables
