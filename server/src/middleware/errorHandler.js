import { AppError } from '../lib/appError.js';

export function errorHandler(error, request, response, next) {
  if (response.headersSent) return next(error);

  const knownError = error instanceof AppError;
  const status = knownError ? error.status : 500;
  const body = {
    error: {
      code: knownError ? error.code : 'INTERNAL_SERVER_ERROR',
      message: knownError ? error.message : 'An unexpected server error occurred.',
      requestId: request.id,
      ...(knownError && error.fields ? { fields: error.fields } : {}),
    },
  };

  if (!knownError) request.log?.error({ err: error }, 'Unhandled request error');
  return response.status(status).json(body);
}
