import { toSlug } from '../../lib/slug.js';
import { createOpaqueToken } from '../../lib/tokens.js';

export function createJobSlug(title, { suffixFactory = createOpaqueToken } = {}) {
  const base = toSlug(title) || 'job';
  return `${base}-${suffixFactory().slice(0, 10).toLowerCase()}`;
}
