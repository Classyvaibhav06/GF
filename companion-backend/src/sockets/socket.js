import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import { processChatMessage } from '../services/chatService.js';

export const setupSocket = (io) => {
  // Middleware for Socket authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) return next(new Error('User not found'));
      
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`User connected via socket: ${socket.user.id}`);

    // Join a room specific to the user for private routing
    socket.join(`user_${socket.user.id}`);

    socket.on('typing', (data) => {
      // In a more complex setup where two users talk, we'd emit this to the other user.
      // For AI, we can just log it or ignore it.
      logger.info(`User ${socket.user.id} is typing to ${data.characterId}`);
    });

    socket.on('message', async (data) => {
      const { characterId, message } = data;
      
      try {
        // Send a message:received confirmation back to the client immediately
        socket.emit('message:received', { status: 'received', message });

        // Tell the client AI is typing
        socket.emit('typing', { characterId, isTyping: true });

        // Process message via AI Service
        const aiResponse = await processChatMessage(socket.user.id, characterId, message);

        // Tell the client AI stopped typing
        socket.emit('typing', { characterId, isTyping: false });

        // Send AI response back to the specific user's room
        io.to(`user_${socket.user.id}`).emit('message', {
          sender: 'assistant',
          characterId,
          content: aiResponse,
          timestamp: new Date()
        });
      } catch (error) {
        logger.error(`Socket message processing error: ${error.message}`);
        socket.emit('typing', { characterId, isTyping: false });
        socket.emit('error', { message: 'Failed to process message' });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.user.id}`);
    });
  });
};
