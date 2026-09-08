import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';

const server = createServer(createApp());

server.listen(env.PORT, () => {
  logger.info({ port: env.PORT, environment: env.NODE_ENV }, 'CareerBridge API listening');
});

function shutdown(signal) {
  logger.info({ signal }, 'Shutting down CareerBridge API');
  server.close((error) => {
    if (error) {
      logger.error({ err: error }, 'Server shutdown failed');
      process.exitCode = 1;
    }
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
