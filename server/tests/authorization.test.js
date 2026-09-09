import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../src/lib/appError.js';
import { requireAuth, requireRole } from '../src/middleware/authorization.js';

describe('authorization middleware', () => {
  it('requires an authenticated session', () => {
    const next = vi.fn();

    requireAuth({ auth: null }, {}, next);

    expect(next.mock.calls[0][0]).toMatchObject({
      code: 'AUTHENTICATION_REQUIRED',
      status: 401,
    });
  });

  it('allows users with an explicitly accepted role', () => {
    const next = vi.fn();

    requireRole('RECRUITER')({ auth: { user: { role: 'RECRUITER' } } }, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects authenticated users with the wrong role', () => {
    const next = vi.fn();

    requireRole('ADMIN')({ auth: { user: { role: 'APPLICANT' } } }, {}, next);

    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({ code: 'FORBIDDEN', status: 403 });
  });
});
