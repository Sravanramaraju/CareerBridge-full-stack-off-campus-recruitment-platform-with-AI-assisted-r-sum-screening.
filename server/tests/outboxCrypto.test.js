import { describe, expect, it } from 'vitest';
import {
  openOutboxPayload,
  protectOutboxPayload,
} from '../src/modules/email/outboxCrypto.js';

describe('email outbox payload protection', () => {
  it('encrypts sensitive payloads and restores them for delivery', () => {
    const payload = { resetToken: 'raw-secret-token', name: 'Ananya' };
    const encrypted = protectOutboxPayload(payload);

    expect(JSON.stringify(encrypted)).not.toContain('raw-secret-token');
    expect(openOutboxPayload(encrypted)).toEqual(payload);
  });

  it('detects authenticated-ciphertext tampering', () => {
    const encrypted = protectOutboxPayload({ resetToken: 'raw-secret-token' });
    encrypted.ciphertext = `${encrypted.ciphertext.slice(0, -1)}A`;

    expect(() => openOutboxPayload(encrypted)).toThrow();
  });
});
