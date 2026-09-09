import { z } from 'zod';
import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../src/lib/appError.js';
import { validateRequest } from '../src/middleware/validateRequest.js';

describe('request validation middleware', () => {
  it('stores parsed request values for controllers', () => {
    const request = { body: { page: '2', ignored: true } };
    const next = vi.fn();

    validateRequest({ body: z.object({ page: z.coerce.number().int() }) })(request, {}, next);

    expect(request.validated.body).toEqual({ page: 2 });
    expect(next).toHaveBeenCalledWith();
  });

  it('maps Zod issues to the public validation error envelope', () => {
    const request = { body: { email: 'invalid' } };
    const next = vi.fn();

    validateRequest({ body: z.object({ email: z.email() }) })(request, {}, next);

    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({
      code: 'VALIDATION_ERROR',
      status: 422,
      fields: { 'body.email': expect.any(String) },
    });
  });
});
