import { AppError } from './appError.js';

export function mapPrismaError(error) {
  if (error?.name !== 'PrismaClientKnownRequestError') return error;

  if (error.code === 'P2002') {
    return new AppError({
      code: 'CONFLICT',
      message: 'A record with these details already exists.',
      status: 409,
      cause: error,
    });
  }

  if (error.code === 'P2025') {
    return new AppError({
      code: 'NOT_FOUND',
      message: 'The requested resource was not found.',
      status: 404,
      cause: error,
    });
  }

  if (error.code === 'P2003') {
    return new AppError({
      code: 'RELATION_CONFLICT',
      message: 'This operation conflicts with a related record.',
      status: 409,
      cause: error,
    });
  }

  return error;
}
