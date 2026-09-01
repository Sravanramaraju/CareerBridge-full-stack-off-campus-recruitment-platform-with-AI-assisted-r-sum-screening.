import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '@/src/store/useAppStore';

describe('recruiter company profile', () => {
  beforeEach(() => {
    useAppStore.setState({ companyProfile: { name: 'Northstar Labs', website: '' } });
  });

  it('merges edited fields without dropping existing company data', () => {
    useAppStore.getState().updateCompanyProfile({ website: 'https://northstar.example' });

    expect(useAppStore.getState().companyProfile).toEqual({
      name: 'Northstar Labs',
      website: 'https://northstar.example',
    });
  });
});
