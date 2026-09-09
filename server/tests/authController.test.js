import { describe, expect, it, vi } from 'vitest';
import {
  createLoginHandler,
  createLogoutHandler,
  currentUserHandler,
} from '../src/modules/auth/auth.controller.js';

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
    const response = {
      cookie: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn((body) => body),
    };
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
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json.mock.calls[0][0]).not.toHaveProperty('data.token');
    expect(next).not.toHaveBeenCalled();
  });

  it('returns the current safe user from authenticated context', () => {
    const expiresAt = new Date('2026-09-10T00:00:00.000Z');
    const request = {
      auth: {
        expiresAt,
        user: {
          id: 'user-1',
          name: 'Ananya Rao',
          email: 'ananya@example.com',
          role: 'APPLICANT',
          status: 'ACTIVE',
          passwordHash: 'never-return-this',
        },
      },
    };
    const response = { json: vi.fn((body) => body) };

    currentUserHandler(request, response);

    expect(response.json).toHaveBeenCalledWith({
      data: {
        user: expect.objectContaining({ id: 'user-1', role: 'APPLICANT' }),
        expiresAt,
      },
    });
    expect(response.json.mock.calls[0][0].data.user).not.toHaveProperty('passwordHash');
  });

  it('revokes the active session and clears both cookies on logout', async () => {
    const revoke = vi.fn().mockResolvedValue({ count: 1 });
    const request = { cookies: { careerbridge_session: 'raw-token' } };
    const response = {
      clearCookie: vi.fn(),
      json: vi.fn((body) => body),
    };

    await createLogoutHandler({ revoke })(request, response, vi.fn());

    expect(revoke).toHaveBeenCalledWith('raw-token');
    expect(response.clearCookie).toHaveBeenCalledTimes(2);
    expect(response.json).toHaveBeenCalledWith({ data: { loggedOut: true } });
  });
});
