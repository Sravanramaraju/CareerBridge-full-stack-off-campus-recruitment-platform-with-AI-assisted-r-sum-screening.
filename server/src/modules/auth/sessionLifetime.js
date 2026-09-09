import { env } from '../../config/env.js';

const HOUR_IN_MILLISECONDS = 60 * 60 * 1_000;
const DAY_IN_MILLISECONDS = 24 * HOUR_IN_MILLISECONDS;

export function getSessionExpiry(rememberMe, now = new Date()) {
  const duration = rememberMe
    ? env.REMEMBER_ME_TTL_DAYS * DAY_IN_MILLISECONDS
    : env.SESSION_TTL_HOURS * HOUR_IN_MILLISECONDS;

  return new Date(now.getTime() + duration);
}
