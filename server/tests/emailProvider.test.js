import { describe, expect, it, vi } from 'vitest';
import { createEmailProvider } from '../src/modules/email/email.provider.js';

describe('SMTP email provider', () => {
  it('maps provider-neutral messages to SMTP mail', async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: 'message-1' });
    const provider = createEmailProvider({
      transport: { sendMail },
      from: 'CareerBridge <no-reply@example.com>',
    });

    await provider.send({
      recipient: 'user@example.com',
      subject: 'Application update',
      text: 'Your application was updated.',
      html: '<p>Your application was updated.</p>',
    });

    expect(sendMail).toHaveBeenCalledWith({
      from: 'CareerBridge <no-reply@example.com>',
      to: 'user@example.com',
      subject: 'Application update',
      text: 'Your application was updated.',
      html: '<p>Your application was updated.</p>',
    });
  });
});
