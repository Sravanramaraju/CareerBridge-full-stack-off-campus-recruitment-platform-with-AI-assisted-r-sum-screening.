import { describe, expect, it, vi } from 'vitest';
import { createLoginHandler } from '../src/modules/auth/auth.controller.js';

describe('authentication controller', () => {
  it('sets secure session cookies without returning raw tokens', async () => {
    const expiresAt = new Date('2026-09-10T00:00:00.000Z');
    const authenticate = vi.fn().mockResolvedValue({
      user: { id: 'user-1', role: 'APPLICANT' },
      token: 'raw-session',
      csrfToken: 'raw-csrf',
      expiresAt,
    });
    const request = {
      validated: { body: { email: 'user@example.com', password: 'password', rememberMe: false } },
      get: vi.fn().mockReturnValue('test-agent'),
    };
    const response = { cookie: vi.fn(), json: vi.fn((body) => body) };
    const next = vi.fn();

    await createLoginHandler({ authenticate })(request, response, next);

    expect(response.cookie).toHaveBeenCalledTimes(2);
    expect(response.cookie).toHaveBeenCalledWith(
      'careerbridge_session',
      'raw-session',
      expect.objectContaining({ httpOnly: true, expires: expiresAt }),
    );
    expect(response.json).toHaveBeenCalledWith({
      data: { user: { id: 'user-1', role: 'APPLICANT' }, expiresAt },
    });
    expect(response.json.mock.calls[0][0]).not.toHaveProperty('data.token');
    expect(next).not.toHaveBeenCalled();
  });
});
