import { randomUUID } from 'node:crypto';
import pinoHttp from 'pino-http';
import { logger } from '../lib/logger.js';

export const requestLogger = pinoHttp({
  logger,
  genReqId(request, response) {
    const requestId = request.headers['x-request-id'] || randomUUID();
    response.setHeader('X-Request-Id', requestId);
    return requestId;
  },
  customLogLevel(_request, response, error) {
    if (error || response.statusCode >= 500) return 'error';
    if (response.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req(request) {
      return { id: request.id, method: request.method, url: request.url };
    },
    res(response) {
      return { statusCode: response.statusCode };
    },
  },
});
