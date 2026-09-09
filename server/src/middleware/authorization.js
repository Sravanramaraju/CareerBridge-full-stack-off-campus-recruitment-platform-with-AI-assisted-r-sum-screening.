import { AppError } from '../lib/appError.js';

export function requireAuth(request, _response, next) {
  if (!request.auth?.user) {
    return next(
      new AppError({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Please sign in to continue.',
        status: 401,
      }),
    );
  }

  return next();
}

export function requireRole(...allowedRoles) {
  return (request, _response, next) => {
    if (!request.auth?.user) return requireAuth(request, _response, next);

    if (!allowedRoles.includes(request.auth.user.role)) {
      return next(
        new AppError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action.',
          status: 403,
        }),
      );
    }

    return next();
  };
}
