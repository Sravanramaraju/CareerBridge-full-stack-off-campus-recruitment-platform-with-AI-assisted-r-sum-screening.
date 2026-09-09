import { describe, expect, it } from 'vitest';
import { toPublicCompany } from '../src/modules/companies/company.presenter.js';

describe('public company presenter', () => {
  it('preserves the current frontend contract from canonical fields', () => {
    const result = toPublicCompany({
      id: 'company-1',
      name: 'Northstar Labs',
      slug: 'northstar-labs',
      headquarters: 'Bengaluru, Karnataka',
      locations: ['Bengaluru, Karnataka', 'Remote within India'],
      foundedYear: 2018,
      brandInitials: 'NL',
      brandColor: '#123456',
      verificationStatus: 'VERIFIED',
      _count: { jobs: 4 },
    });

    expect(result).toMatchObject({
      id: 'company-1',
      initials: 'NL',
      accent: '#123456',
      location: 'Bengaluru, Karnataka',
      founded: 2018,
      verified: true,
      openRoles: 4,
    });
    expect(result).not.toHaveProperty('_count');
  });

  it('derives safe display fallbacks for incomplete optional branding', () => {
    const result = toPublicCompany({
      name: 'Paperplane Studio',
      headquarters: null,
      locations: ['Remote, India'],
      foundedYear: null,
      brandInitials: null,
      brandColor: null,
      verificationStatus: 'PENDING',
      _count: { jobs: 0 },
    });

    expect(result).toMatchObject({
      initials: 'PS',
      accent: '#2658d8',
      location: 'Remote, India',
      verified: false,
      openRoles: 0,
    });
  });
});
