import { enqueueEmail } from './emailOutbox.repository.js';
import { protectOutboxPayload } from './outboxCrypto.js';

export function queueEmail(
  { recipient, subject, template, payload },
  database,
  { enqueue = enqueueEmail, protect = protectOutboxPayload } = {},
) {
  return enqueue(
    {
      recipient,
      subject,
      template,
      payload: protect(payload),
    },
    database,
  );
}
