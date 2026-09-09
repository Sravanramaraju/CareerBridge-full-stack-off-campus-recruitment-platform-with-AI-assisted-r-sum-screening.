import { createHash, randomBytes } from 'node:crypto';

const TOKEN_BYTES = 32;

export function createOpaqueToken() {
  return randomBytes(TOKEN_BYTES).toString('base64url');
}

export function hashOpaqueToken(token) {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}
