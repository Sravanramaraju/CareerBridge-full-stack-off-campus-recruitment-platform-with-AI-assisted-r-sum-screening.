import { describe, expect, it, vi } from 'vitest';
import { queueEmail } from '../src/modules/email/emailOutbox.service.js';

describe('email outbox service', () => {
  it('protects payloads before transactionally queuing them', async () => {
    const enqueue = vi.fn().mockResolvedValue({ id: 'email-1' });
    const protect = vi.fn().mockReturnValue({ ciphertext: 'encrypted' });
    const database = { marker: 'transaction-client' };

    await queueEmail(
      {
        recipient: 'user@example.com',
        subject: 'Reset your password',
        template: 'password-reset',
        payload: { resetToken: 'raw-token' },
      },
      database,
      { enqueue, protect },
    );

    expect(protect).toHaveBeenCalledWith({ resetToken: 'raw-token' });
    expect(enqueue).toHaveBeenCalledWith(
      {
        recipient: 'user@example.com',
        subject: 'Reset your password',
        template: 'password-reset',
        payload: { ciphertext: 'encrypted' },
      },
      database,
    );
  });
});
