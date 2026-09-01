import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '@/src/store/useAppStore';

describe('recruiter candidate pipeline', () => {
  beforeEach(() => {
    useAppStore.setState({ candidateStatuses: { 'application-101': 'Applied' } });
  });

  it('moves a candidate into the selected stage', () => {
    useAppStore.getState().updateCandidateStatus('application-101', 'Interview');

    expect(useAppStore.getState().candidateStatuses['application-101']).toBe('Interview');
  });
});
