import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'node:crypto';
import { env } from '../../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;

function encryptionKey() {
  return Buffer.from(env.OUTBOX_ENCRYPTION_KEY, 'hex');
}

export function protectOutboxPayload(payload) {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), 'utf8'),
    cipher.final(),
  ]);

  return {
    version: 1,
    algorithm: 'A256GCM',
    iv: iv.toString('base64url'),
    tag: cipher.getAuthTag().toString('base64url'),
    ciphertext: ciphertext.toString('base64url'),
  };
}

export function openOutboxPayload(envelope) {
  if (envelope?.version !== 1 || envelope?.algorithm !== 'A256GCM') {
    throw new Error('Unsupported encrypted outbox payload');
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    encryptionKey(),
    Buffer.from(envelope.iv, 'base64url'),
  );
  decipher.setAuthTag(Buffer.from(envelope.tag, 'base64url'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(envelope.ciphertext, 'base64url')),
    decipher.final(),
  ]);

  return JSON.parse(plaintext.toString('utf8'));
}
