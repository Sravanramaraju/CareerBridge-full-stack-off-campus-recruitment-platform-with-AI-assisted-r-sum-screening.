import { describe, expect, it, vi } from 'vitest';
import {
  findAdminJob,
  listAdminJobs,
  updateJobModerationStatus,
} from '../src/modules/admin/adminJob.repository.js';

describe('admin job repository', () => {
  it('searches and paginates job moderation records', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValue(0);
    await listAdminJobs({
      q: 'engineer', status: 'PUBLISHED', moderationStatus: 'FLAGGED', page: 2, pageSize: 10,
    }, { job: { findMany, count } });
    const query = findMany.mock.calls[0][0];
    expect(query.where).toMatchObject({ status: 'PUBLISHED', moderationStatus: 'FLAGGED' });
    expect(query.where.OR).toHaveLength(3);
    expect(query).toMatchObject({ skip: 10, take: 10 });
    expect(count).toHaveBeenCalledWith({ where: query.where });
  });

  it('loads one job with company and activity counts', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    await findAdminJob('job-1', { job: { findUnique } });
    const query = findUnique.mock.calls[0][0];
    expect(query.where).toEqual({ id: 'job-1' });
    expect(query.select).toHaveProperty('company');
    expect(query.select).toHaveProperty('_count');
  });

  it('changes only moderation state with an optimistic current-state guard', async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    await updateJobModerationStatus('job-1', 'PENDING', 'CLEARED', {
      job: { updateMany },
    });
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 'job-1', moderationStatus: 'PENDING' },
      data: { moderationStatus: 'CLEARED' },
    });
  });
});
