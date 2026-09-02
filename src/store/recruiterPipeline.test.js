import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '@/src/store/useAppStore';

describe('recruiter candidate pipeline', () => {
  beforeEach(() => {
    useAppStore.setState({
      candidateStatuses: { 'application-101': 'Applied' },
      candidateStatusHistory: { 'application-101': [{ status: 'Applied', changedAt: '2026-08-20T10:00:00.000Z' }] },
    });
  });

  it('moves a candidate into the selected stage', () => {
    useAppStore.getState().updateCandidateStatus('application-101', 'Interview');

    expect(useAppStore.getState().candidateStatuses['application-101']).toBe('Interview');
  });

  it('records each genuine status change once', () => {
    useAppStore.getState().updateCandidateStatus('application-101', 'Shortlisted');
    useAppStore.getState().updateCandidateStatus('application-101', 'Shortlisted');

    expect(useAppStore.getState().candidateStatusHistory['application-101']).toHaveLength(2);
    expect(useAppStore.getState().candidateStatusHistory['application-101'][1]).toMatchObject({ status: 'Shortlisted' });
  });
});
