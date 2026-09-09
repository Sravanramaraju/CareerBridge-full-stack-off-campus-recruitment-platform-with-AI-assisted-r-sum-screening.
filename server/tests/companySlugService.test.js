import { describe, expect, it, vi } from 'vitest';
import { createAvailableCompanySlug } from '../src/modules/auth/companySlug.service.js';

describe('available company slug generation', () => {
  it('uses the clean company name when it is available', async () => {
    const findCompany = vi.fn().mockResolvedValue(null);

    await expect(
      createAvailableCompanySlug('Northstar Labs', {}, { findCompany }),
    ).resolves.toBe('northstar-labs');
  });

  it('adds a short random suffix after a collision', async () => {
    const findCompany = vi.fn().mockResolvedValueOnce({ id: 'existing' }).mockResolvedValueOnce(null);

    await expect(
      createAvailableCompanySlug('Northstar Labs', {}, {
        findCompany,
        suffixFactory: () => 'abcdef123456',
      }),
    ).resolves.toBe('northstar-labs-abcdef');
  });
});
