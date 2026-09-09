import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '../src/lib/password.js';

describe('password security', () => {
  it('hashes passwords with Argon2id and verifies the matching secret', async () => {
    const password = 'CareerBridge!2026';
    const passwordHash = await hashPassword(password);

    expect(passwordHash).toMatch(/^\$argon2id\$/);
    expect(passwordHash).not.toContain(password);
    await expect(verifyPassword(passwordHash, password)).resolves.toBe(true);
  });

  it('rejects a non-matching password', async () => {
    const passwordHash = await hashPassword('CareerBridge!2026');

    await expect(verifyPassword(passwordHash, 'Different!2026')).resolves.toBe(false);
  });
});
