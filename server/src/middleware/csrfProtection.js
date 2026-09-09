import { timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';
import { AppError } from '../lib/appError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function tokensMatch(first, second) {
  if (!first || !second) return false;
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);
  return firstBuffer.length === secondBuffer.length && timingSafeEqual(firstBuffer, secondBuffer);
}

export function createCsrfProtection({
  clientOrigin = env.CLIENT_ORIGIN,
  production = env.NODE_ENV === 'production',
} = {}) {
  return (request, _response, next) => {
    if (SAFE_METHODS.has(request.method)) return next();

    const origin = request.get('origin');
    if ((production || origin) && origin !== clientOrigin) {
      return next(
        new AppError({
          code: 'INVALID_ORIGIN',
          message: 'The request origin is not allowed.',
          status: 403,
        }),
      );
    }

    const hasSessionCookie = Boolean(request.cookies?.[env.SESSION_COOKIE_NAME]);
    if (!hasSessionCookie) return next();

    const cookieToken = request.cookies?.[env.CSRF_COOKIE_NAME];
    const headerToken = request.get('x-csrf-token');
    if (!tokensMatch(cookieToken, headerToken)) {
      return next(
        new AppError({
          code: 'INVALID_CSRF_TOKEN',
          message: 'The security token is missing or invalid.',
          status: 403,
        }),
      );
    }

    return next();
  };
}

export const csrfProtection = createCsrfProtection();
