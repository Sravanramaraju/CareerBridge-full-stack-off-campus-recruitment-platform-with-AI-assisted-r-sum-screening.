import { env } from '../../config/env.js';
import { csrfCookieOptions, sessionCookieOptions } from './auth.cookies.js';
import { login } from './login.service.js';

export function createLoginHandler({ authenticate = login } = {}) {
  return async (request, response, next) => {
    try {
      const result = await authenticate({
        ...request.validated.body,
        userAgent: request.get('user-agent'),
      });

      response.cookie(
        env.SESSION_COOKIE_NAME,
        result.token,
        sessionCookieOptions(result.expiresAt),
      );
      response.cookie(
        env.CSRF_COOKIE_NAME,
        result.csrfToken,
        csrfCookieOptions(result.expiresAt),
      );
      return response.json({
        data: {
          user: result.user,
          expiresAt: result.expiresAt,
        },
      });
    } catch (error) {
      return next(error);
    }
  };
}

export const loginHandler = createLoginHandler();
