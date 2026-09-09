import { describe, expect, it } from 'vitest';
import { AppError } from '../src/lib/appError.js';
import { mapPrismaError } from '../src/lib/prismaError.js';

function prismaError(code) {
  return { name: 'PrismaClientKnownRequestError', code, meta: { target: ['email'] } };
}

describe('Prisma error mapping', () => {
  it('maps unique violations to a safe conflict response', () => {
    const mapped = mapPrismaError(prismaError('P2002'));

    expect(mapped).toBeInstanceOf(AppError);
    expect(mapped).toMatchObject({ code: 'CONFLICT', status: 409 });
    expect(mapped.message).not.toContain('email');
  });

  it('maps missing mutation targets to not found', () => {
    expect(mapPrismaError(prismaError('P2025'))).toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    });
  });

  it('leaves unknown errors for the generic error handler', () => {
    const error = new Error('unexpected');

    expect(mapPrismaError(error)).toBe(error);
  });
});
