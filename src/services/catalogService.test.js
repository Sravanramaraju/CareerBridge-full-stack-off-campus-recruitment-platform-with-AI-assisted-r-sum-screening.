import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { catalogService } from '@/src/services/mockApi';
import { useAppStore } from '@/src/store/useAppStore';

describe('catalogService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useAppStore.setState({ recruiterDrafts: [] });
  });

  afterEach(() => vi.useRealTimers());

  async function resolveRequest(request) {
    await vi.runAllTimersAsync();
    return request;
  }

  it('filters jobs by skill or title keyword', async () => {
    const results = await resolveRequest(catalogService.listJobs({ keyword: 'React' }));
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((job) => [job.title, ...job.skills].join(' ').toLocaleLowerCase().includes('react'))).toBe(true);
  });

  it('combines work mode and employment type filters', async () => {
    const results = await resolveRequest(catalogService.listJobs({ modes: ['Remote'], types: ['Internship'] }));
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ workMode: 'Remote', employmentType: 'Internship' });
  });

  it('returns null for an unknown job id', async () => {
    const result = await resolveRequest(catalogService.getJob('missing-job'));
    expect(result).toBeNull();
  });
});
