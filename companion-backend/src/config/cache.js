import { createClient } from 'redis';
import logger from '../utils/logger.js';

let redisClient = null;

if (process.env.REDIS_URL) {
  redisClient = createClient({
    url: process.env.REDIS_URL
  });

  redisClient.on('error', (err) => logger.error('Redis Client Error', err));
  
  redisClient.connect().then(() => {
    logger.info('Redis connected successfully');
  }).catch(err => {
    logger.error(`Redis connection failed: ${err.message}`);
  });
} else {
  logger.warn('No REDIS_URL provided. Falling back to in-memory cache.');
  // Simple in-memory mock for development
  redisClient = {
    cache: new Map(),
    get: async (key) => redisClient.cache.get(key),
    set: async (key, value, options) => {
      redisClient.cache.set(key, value);
      if (options && options.EX) {
        setTimeout(() => redisClient.cache.delete(key), options.EX * 1000);
      }
    },
    del: async (key) => redisClient.cache.delete(key),
  };
}

export default redisClient;
