import { describe, expect, it, vi } from 'vitest';
import { createSessionAuth } from '../src/middleware/sessionAuth.js';

describe('session authentication middleware', () => {
  it('attaches safe authenticated context from the session cookie', async () => {
    const request = { cookies: { careerbridge_session: 'raw-token' } };
    const next = vi.fn();
    const resolve = vi.fn().mockResolvedValue({
      id: 'session-1',
      expiresAt: new Date('2026-09-10T00:00:00.000Z'),
      user: { id: 'user-1', role: 'APPLICANT' },
    });

    await createSessionAuth({ resolve })(request, {}, next);

    expect(resolve).toHaveBeenCalledWith('raw-token');
    expect(request.auth).toMatchObject({
      sessionId: 'session-1',
      user: { id: 'user-1', role: 'APPLICANT' },
    });
    expect(next).toHaveBeenCalledWith();
  });

  it('sets a consistent anonymous context when no session resolves', async () => {
    const request = { cookies: {} };
    const next = vi.fn();

    await createSessionAuth({ resolve: vi.fn().mockResolvedValue(null) })(request, {}, next);

    expect(request.auth).toBeNull();
    expect(next).toHaveBeenCalledWith();
  });
});
