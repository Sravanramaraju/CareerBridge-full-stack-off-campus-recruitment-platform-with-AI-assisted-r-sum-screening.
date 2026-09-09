import { describe, expect, it } from 'vitest';
import { loginSchema, normalizedEmailSchema } from '../src/modules/auth/auth.schemas.js';

describe('authentication validation', () => {
  it('normalizes email addresses before persistence or lookup', () => {
    expect(normalizedEmailSchema.parse('  Applicant@CareerBridge.Demo ')).toBe(
      'applicant@careerbridge.demo',
    );
  });

  it('defaults login sessions to non-persistent', () => {
    expect(
      loginSchema.parse({ email: 'user@example.com', password: 'password' }).rememberMe,
    ).toBe(false);
  });

  it('rejects malformed login input', () => {
    expect(
      loginSchema.safeParse({ email: 'not-an-email', password: '', rememberMe: 'yes' }).success,
    ).toBe(false);
  });
});
