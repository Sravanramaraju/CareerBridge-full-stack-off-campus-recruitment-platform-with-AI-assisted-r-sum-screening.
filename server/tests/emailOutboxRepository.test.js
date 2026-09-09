import { describe, expect, it, vi } from 'vitest';
import {
  claimEmail,
  enqueueEmail,
  findPendingEmails,
} from '../src/modules/email/emailOutbox.repository.js';

describe('email outbox repository', () => {
  it('queues provider-neutral email payloads', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'email-1' });
    const email = {
      recipient: 'user@example.com',
      subject: 'Welcome',
      template: 'welcome',
      payload: { name: 'Ananya' },
    };

    await enqueueEmail(email, { emailOutbox: { create } });

    expect(create).toHaveBeenCalledWith({ data: email });
  });

  it('selects only due pending messages in chronological order', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const now = new Date('2026-09-09T00:00:00.000Z');

    await findPendingEmails({ now, limit: 5 }, { emailOutbox: { findMany } });

    expect(findMany).toHaveBeenCalledWith({
      where: { status: 'PENDING', nextAttemptAt: { lte: now } },
      orderBy: { createdAt: 'asc' },
      take: 5,
    });
  });

  it('claims a pending message using a conditional update', async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });

    await claimEmail('email-1', new Date('2026-09-09T00:00:00.000Z'), {
      emailOutbox: { updateMany },
    });

    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'email-1', status: 'PENDING' }),
        data: expect.objectContaining({ status: 'PROCESSING', attemptCount: { increment: 1 } }),
      }),
    );
  });
});
