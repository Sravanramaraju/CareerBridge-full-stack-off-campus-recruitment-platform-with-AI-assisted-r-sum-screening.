import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { disconnectDatabase } from './lib/database.js';
import { logger } from './lib/logger.js';
import { emailWorker } from './modules/email/emailWorker.js';
import { checkDatabase } from './modules/health/health.service.js';

const server = createServer(createApp({ databaseCheck: checkDatabase }));

server.listen(env.PORT, () => {
  logger.info({ port: env.PORT, environment: env.NODE_ENV }, 'CareerBridge API listening');
  emailWorker.start();
});

function shutdown(signal) {
  logger.info({ signal }, 'Shutting down CareerBridge API');
  server.close(async (error) => {
    if (error) {
      logger.error({ err: error }, 'Server shutdown failed');
      process.exitCode = 1;
    }

    await emailWorker.stop();
    await disconnectDatabase();
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
