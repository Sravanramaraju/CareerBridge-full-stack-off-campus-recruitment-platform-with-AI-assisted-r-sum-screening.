import { describe, expect, it, vi } from 'vitest';
import { createCsrfProtection } from '../src/middleware/csrfProtection.js';

function createRequest({ method = 'POST', origin, session, csrfCookie, csrfHeader } = {}) {
  const headers = { origin, 'x-csrf-token': csrfHeader };
  return {
    method,
    cookies: {
      ...(session ? { careerbridge_session: session } : {}),
      ...(csrfCookie ? { careerbridge_csrf: csrfCookie } : {}),
    },
    get: (name) => headers[name.toLowerCase()],
  };
}

describe('CSRF protection', () => {
  it('allows safe requests without a token', () => {
    const next = vi.fn();

    createCsrfProtection()(createRequest({ method: 'GET' }), {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('requires matching tokens for authenticated unsafe requests', () => {
    const next = vi.fn();

    createCsrfProtection()(
      createRequest({ session: 'session', csrfCookie: 'cookie-token', csrfHeader: 'other' }),
      {},
      next,
    );

    expect(next.mock.calls[0][0]).toMatchObject({ code: 'INVALID_CSRF_TOKEN', status: 403 });
  });

  it('allows matching double-submit tokens', () => {
    const next = vi.fn();

    createCsrfProtection()(
      createRequest({ session: 'session', csrfCookie: 'token', csrfHeader: 'token' }),
      {},
      next,
    );

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects an untrusted origin before authentication', () => {
    const next = vi.fn();

    createCsrfProtection({ clientOrigin: 'https://careerbridge.example', production: true })(
      createRequest({ origin: 'https://attacker.example' }),
      {},
      next,
    );

    expect(next.mock.calls[0][0]).toMatchObject({ code: 'INVALID_ORIGIN', status: 403 });
  });
});
