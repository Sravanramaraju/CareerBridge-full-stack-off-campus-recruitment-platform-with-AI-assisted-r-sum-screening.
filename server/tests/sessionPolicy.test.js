import { describe, expect, it } from 'vitest';
import {
  csrfCookieOptions,
  sessionCookieOptions,
} from '../src/modules/auth/auth.cookies.js';
import { getSessionExpiry } from '../src/modules/auth/sessionLifetime.js';

describe('session policy', () => {
  it('keeps session cookies inaccessible to browser scripts', () => {
    const expires = new Date('2026-09-10T00:00:00.000Z');

    expect(sessionCookieOptions(expires)).toMatchObject({
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      expires,
    });
  });

  it('makes only the CSRF cookie readable to the frontend', () => {
    expect(csrfCookieOptions(new Date()).httpOnly).toBe(false);
  });

  it('uses a longer lifetime only when remember-me is selected', () => {
    const now = new Date('2026-09-09T00:00:00.000Z');

    expect(getSessionExpiry(false, now).getTime() - now.getTime()).toBe(24 * 60 * 60 * 1_000);
    expect(getSessionExpiry(true, now).getTime() - now.getTime()).toBe(30 * 24 * 60 * 60 * 1_000);
  });
});
