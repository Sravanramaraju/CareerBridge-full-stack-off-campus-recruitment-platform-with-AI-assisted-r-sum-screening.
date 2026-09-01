import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '@/src/store/useAppStore';

describe('admin moderation state', () => {
  beforeEach(() => {
    useAppStore.setState({ adminCompanyStates: {}, adminJobStates: {}, adminUserStates: {} });
  });

  it('records company and job review decisions', () => {
    const store = useAppStore.getState();
    store.setAdminCompanyState('company-1', 'Verified');
    store.setAdminJobState('job-1', 'Rejected');

    expect(useAppStore.getState().adminCompanyStates['company-1']).toBe('Verified');
    expect(useAppStore.getState().adminJobStates['job-1']).toBe('Rejected');
  });

  it('records a user account state change', () => {
    useAppStore.getState().setAdminUserState('user-1', 'Suspended');
    expect(useAppStore.getState().adminUserStates['user-1']).toBe('Suspended');
  });
});
