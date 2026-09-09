import { argon2id, hash, verify } from 'argon2';

const ARGON2_OPTIONS = Object.freeze({
  type: argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
});

export function hashPassword(password) {
  return hash(password, ARGON2_OPTIONS);
}

export function verifyPassword(passwordHash, password) {
  return verify(passwordHash, password);
}
