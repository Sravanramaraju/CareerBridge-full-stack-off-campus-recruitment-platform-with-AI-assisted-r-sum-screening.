import { env } from '../config/env.js';
import { resolveSession } from '../modules/auth/session.service.js';

export function createSessionAuth({ resolve = resolveSession } = {}) {
  return async (request, _response, next) => {
    try {
      const token = request.cookies?.[env.SESSION_COOKIE_NAME];
      const session = await resolve(token);

      request.auth = session
        ? { sessionId: session.id, user: session.user, expiresAt: session.expiresAt }
        : null;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

export const sessionAuth = createSessionAuth();
