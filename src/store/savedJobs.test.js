import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '@/src/store/useAppStore';

describe('saved job state', () => {
  beforeEach(() => {
    useAppStore.setState({ savedJobIds: [] });
  });

  it('adds and removes a saved job', () => {
    useAppStore.getState().toggleSavedJob('frontend-engineer-atlas');
    expect(useAppStore.getState().savedJobIds).toEqual(['frontend-engineer-atlas']);

    useAppStore.getState().toggleSavedJob('frontend-engineer-atlas');
    expect(useAppStore.getState().savedJobIds).toEqual([]);
  });
});
