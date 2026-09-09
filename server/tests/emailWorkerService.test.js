import { describe, expect, it, vi } from 'vitest';
import { processEmailBatch } from '../src/modules/email/emailWorker.service.js';

function queuedEmail(overrides = {}) {
  return {
    id: 'email-1',
    recipient: 'user@example.com',
    subject: 'Reset your password',
    template: 'password-reset',
    payload: { encrypted: true },
    attemptCount: 0,
    ...overrides,
  };
}

describe('email outbox worker', () => {
  it('claims, renders, sends, and marks a pending message sent', async () => {
    const send = vi.fn().mockResolvedValue({ messageId: 'message-1' });
    const markSent = vi.fn().mockResolvedValue({});
    const now = new Date('2026-09-09T00:00:00.000Z');

    const result = await processEmailBatch(
      { now },
      {
        findPending: vi.fn().mockResolvedValue([queuedEmail()]),
        claim: vi.fn().mockResolvedValue({ count: 1 }),
        openPayload: vi.fn().mockReturnValue({ name: 'Ananya' }),
        render: vi.fn().mockReturnValue({ text: 'text', html: '<p>text</p>' }),
        provider: { send },
        markSent,
      },
    );

    expect(send).toHaveBeenCalledWith({
      recipient: 'user@example.com',
      subject: 'Reset your password',
      text: 'text',
      html: '<p>text</p>',
    });
    expect(markSent).toHaveBeenCalledWith('email-1', now);
    expect(result.sent).toBe(1);
  });

  it('returns a failed delivery to pending with exponential backoff', async () => {
    const markFailed = vi.fn().mockResolvedValue({});
    const now = new Date('2026-09-09T00:00:00.000Z');

    const result = await processEmailBatch(
      { now },
      {
        findPending: vi.fn().mockResolvedValue([queuedEmail({ attemptCount: 1 })]),
        claim: vi.fn().mockResolvedValue({ count: 1 }),
        openPayload: vi.fn().mockReturnValue({}),
        render: vi.fn().mockReturnValue({ text: 'text', html: 'html' }),
        provider: { send: vi.fn().mockRejectedValue(new Error('SMTP unavailable')) },
        markFailed,
      },
    );

    expect(markFailed).toHaveBeenCalledWith(
      'email-1',
      expect.objectContaining({ status: 'PENDING', lastError: 'SMTP unavailable' }),
    );
    expect(result.retried).toBe(1);
  });
});
