import { describe, expect, it } from 'vitest';
import { createOpaqueToken, hashOpaqueToken } from '../src/lib/tokens.js';

describe('opaque token utilities', () => {
  it('generates URL-safe high-entropy tokens', () => {
    const first = createOpaqueToken();
    const second = createOpaqueToken();

    expect(first).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(second).not.toBe(first);
  });

  it('creates deterministic SHA-256 token hashes', () => {
    expect(hashOpaqueToken('token')).toBe(
      '3c469e9d6c5875d37a43f353d4f88e61fcf812c66eee3457465a40b0da4153e0',
    );
  });
});
