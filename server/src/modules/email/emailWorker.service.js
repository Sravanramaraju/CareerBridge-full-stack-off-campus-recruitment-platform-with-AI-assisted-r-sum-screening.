import { emailProvider } from './email.provider.js';
import { renderEmailTemplate } from './email.templates.js';
import {
  claimEmail,
  findPendingEmails,
  markEmailFailed,
  markEmailSent,
} from './emailOutbox.repository.js';
import { openOutboxPayload } from './outboxCrypto.js';

const MAX_ATTEMPTS = 5;
const RETRY_BASE_MS = 60 * 1_000;

function retryTime(attemptCount, now) {
  return new Date(now.getTime() + RETRY_BASE_MS * 2 ** Math.max(0, attemptCount - 1));
}

export async function processEmailBatch(
  { now = new Date(), limit = 10 } = {},
  {
    findPending = findPendingEmails,
    claim = claimEmail,
    openPayload = openOutboxPayload,
    render = renderEmailTemplate,
    provider = emailProvider,
    markSent = markEmailSent,
    markFailed = markEmailFailed,
  } = {},
) {
  const pending = await findPending({ now, limit });
  const result = { found: pending.length, sent: 0, retried: 0, failed: 0 };

  for (const email of pending) {
    const claimed = await claim(email.id, now);
    if (claimed.count !== 1) continue;

    const attemptCount = email.attemptCount + 1;
    try {
      const content = render(email.template, openPayload(email.payload));
      await provider.send({ recipient: email.recipient, subject: email.subject, ...content });
      await markSent(email.id, now);
      result.sent += 1;
    } catch (error) {
      const exhausted = attemptCount >= MAX_ATTEMPTS;
      await markFailed(email.id, {
        status: exhausted ? 'FAILED' : 'PENDING',
        lastError: String(error?.message || error).slice(0, 1_000),
        nextAttemptAt: retryTime(attemptCount, now),
      });
      result[exhausted ? 'failed' : 'retried'] += 1;
    }
  }

  return result;
}
