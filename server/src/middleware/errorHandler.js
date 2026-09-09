import { AppError } from '../lib/appError.js';
import { mapPrismaError } from '../lib/prismaError.js';

export function errorHandler(error, request, response, next) {
  if (response.headersSent) return next(error);

  const mappedError = mapPrismaError(error);
  const knownError = mappedError instanceof AppError;
  const status = knownError ? mappedError.status : 500;
  const body = {
    error: {
      code: knownError ? mappedError.code : 'INTERNAL_SERVER_ERROR',
      message: knownError ? mappedError.message : 'An unexpected server error occurred.',
      requestId: request.id,
      ...(knownError && mappedError.fields ? { fields: mappedError.fields } : {}),
    },
  };

  if (!knownError) request.log?.error({ err: mappedError }, 'Unhandled request error');
  return response.status(status).json(body);
}
