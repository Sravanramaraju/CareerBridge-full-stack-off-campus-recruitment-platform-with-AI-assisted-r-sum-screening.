import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const MINUTE_IN_MILLISECONDS = 60 * 1_000;

export function createRequestRateLimit({ windowMs, max, code = 'RATE_LIMITED' }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (request, response) =>
      response.status(429).json({
        error: {
          code,
          message: 'Too many requests. Please wait before trying again.',
          requestId: request.id,
        },
      }),
  });
}

export const authAccountRateLimit = createRequestRateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MINUTES * MINUTE_IN_MILLISECONDS,
  max: env.AUTH_RATE_LIMIT_MAX,
  code: 'AUTH_RATE_LIMITED',
});

export const passwordRecoveryRateLimit = createRequestRateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MINUTES * MINUTE_IN_MILLISECONDS,
  max: env.PASSWORD_RATE_LIMIT_MAX,
  code: 'PASSWORD_RECOVERY_RATE_LIMITED',
});
