import { env } from '../../config/env.js';
import {
  clearedCsrfCookieOptions,
  clearedSessionCookieOptions,
  csrfCookieOptions,
  sessionCookieOptions,
} from './auth.cookies.js';
import { login } from './login.service.js';
import { requestPasswordReset, resetPassword } from './passwordRecovery.service.js';
import { toSafeUser } from './safeUser.js';
import { revokeSession } from './session.service.js';
import { registerApplicant, registerRecruiter } from './signup.service.js';

function sendAuthenticatedResponse(response, result, status = 200) {
  response.cookie(
    env.SESSION_COOKIE_NAME,
    result.token,
    sessionCookieOptions(result.expiresAt),
  );
  response.cookie(env.CSRF_COOKIE_NAME, result.csrfToken, csrfCookieOptions(result.expiresAt));
  return response.status(status).json({
    data: {
      user: result.user,
      expiresAt: result.expiresAt,
    },
  });
}

export function createLoginHandler({ authenticate = login } = {}) {
  return async (request, response, next) => {
    try {
      const result = await authenticate({
        ...request.validated.body,
        userAgent: request.get('user-agent'),
      });

      return sendAuthenticatedResponse(response, result);
    } catch (error) {
      return next(error);
    }
  };
}

export const loginHandler = createLoginHandler();

export function createApplicantSignupHandler({ register = registerApplicant } = {}) {
  return async (request, response, next) => {
    try {
      const result = await register({
        ...request.validated.body,
        userAgent: request.get('user-agent'),
      });
      return sendAuthenticatedResponse(response, result, 201);
    } catch (error) {
      return next(error);
    }
  };
}

export const applicantSignupHandler = createApplicantSignupHandler();

export function createRecruiterSignupHandler({ register = registerRecruiter } = {}) {
  return async (request, response, next) => {
    try {
      const result = await register({
        ...request.validated.body,
        userAgent: request.get('user-agent'),
      });
      return sendAuthenticatedResponse(response, result, 201);
    } catch (error) {
      return next(error);
    }
  };
}

export const recruiterSignupHandler = createRecruiterSignupHandler();

export function createForgotPasswordHandler({ requestReset = requestPasswordReset } = {}) {
  return async (request, response, next) => {
    try {
      await requestReset(request.validated.body.email);
      return response.status(202).json({
        data: {
          message: 'If an account exists for that email, reset instructions have been sent.',
        },
      });
    } catch (error) {
      return next(error);
    }
  };
}

export const forgotPasswordHandler = createForgotPasswordHandler();

export function createResetPasswordHandler({ reset = resetPassword } = {}) {
  return async (request, response, next) => {
    try {
      const result = await reset(request.validated.body);
      response.clearCookie(env.SESSION_COOKIE_NAME, clearedSessionCookieOptions());
      response.clearCookie(env.CSRF_COOKIE_NAME, clearedCsrfCookieOptions());
      return response.status(200).json({ data: result });
    } catch (error) {
      return next(error);
    }
  };
}

export const resetPasswordHandler = createResetPasswordHandler();

export function currentUserHandler(request, response) {
  return response.json({
    data: {
      user: toSafeUser(request.auth.user),
      expiresAt: request.auth.expiresAt,
    },
  });
}

export function createLogoutHandler({ revoke = revokeSession } = {}) {
  return async (request, response, next) => {
    try {
      await revoke(request.cookies?.[env.SESSION_COOKIE_NAME]);
      response.clearCookie(env.SESSION_COOKIE_NAME, clearedSessionCookieOptions());
      response.clearCookie(env.CSRF_COOKIE_NAME, clearedCsrfCookieOptions());
      return response.json({ data: { loggedOut: true } });
    } catch (error) {
      return next(error);
    }
  };
}

export const logoutHandler = createLogoutHandler();
