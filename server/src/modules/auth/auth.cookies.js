import { env } from '../../config/env.js';

const COOKIE_BASE = Object.freeze({
  sameSite: 'lax',
  secure: env.NODE_ENV === 'production',
  path: '/',
});

export function sessionCookieOptions(expires) {
  return {
    ...COOKIE_BASE,
    httpOnly: true,
    expires,
  };
}

export function csrfCookieOptions(expires) {
  return {
    ...COOKIE_BASE,
    httpOnly: false,
    expires,
  };
}

export function clearedSessionCookieOptions() {
  return { ...COOKIE_BASE, httpOnly: true };
}

export function clearedCsrfCookieOptions() {
  return { ...COOKIE_BASE, httpOnly: false };
}
