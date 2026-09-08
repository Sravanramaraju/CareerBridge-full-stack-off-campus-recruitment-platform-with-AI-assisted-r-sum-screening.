import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { API_PREFIX, REQUEST_BODY_LIMIT } from './config/constants.js';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import { requestLogger } from './middleware/requestLogger.js';
import { createHealthRouter } from './modules/health/health.routes.js';

export function createApp({ databaseCheck } = {}) {
  const app = express();

  app.disable('x-powered-by');
  app.use(requestLogger);
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: REQUEST_BODY_LIMIT }));
  app.use(express.urlencoded({ extended: false, limit: REQUEST_BODY_LIMIT }));

  app.use(`${API_PREFIX}/health`, createHealthRouter({ databaseCheck }));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
