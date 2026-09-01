import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '@/src/store/useAppStore';

describe('application state', () => {
  beforeEach(() => {
    useAppStore.setState({ applications: [] });
  });

  it('creates a new application with an applied timeline event', () => {
    const application = useAppStore.getState().submitApplication('frontend-engineer-atlas', 'Excited to contribute.');

    expect(application).toMatchObject({
      jobId: 'frontend-engineer-atlas',
      status: 'Applied',
      coverNote: 'Excited to contribute.',
    });
    expect(application.timeline[0].status).toBe('Applied');
  });

  it('prevents duplicate applications for the same job', () => {
    useAppStore.getState().submitApplication('frontend-engineer-atlas');
    const duplicate = useAppStore.getState().submitApplication('frontend-engineer-atlas');

    expect(duplicate).toBeNull();
    expect(useAppStore.getState().applications).toHaveLength(1);
  });
});
