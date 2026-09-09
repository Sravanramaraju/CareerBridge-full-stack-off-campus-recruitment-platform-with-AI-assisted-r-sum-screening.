import { describe, expect, it } from 'vitest';
import { toSlug } from '../src/lib/slug.js';

describe('slug generation', () => {
  it('normalizes company names into stable public slugs', () => {
    expect(toSlug('  Northstar Labs & Co.  ')).toBe('northstar-labs-co');
  });

  it('removes combining marks and repeated separators', () => {
    expect(toSlug('Café—Careers')).toBe('cafe-careers');
  });
});
