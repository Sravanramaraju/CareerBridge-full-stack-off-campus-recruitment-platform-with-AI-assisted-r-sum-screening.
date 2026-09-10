import { describe, expect, it, vi } from 'vitest';
import { getAdminJobs } from '../src/modules/admin/adminJob.service.js';

describe('admin job service', () => {
  it('presents and paginates the job moderation queue', async () => {
    const filters = { moderationStatus: 'FLAGGED', page: 1, pageSize: 20 };
    const date = new Date('2026-09-10T00:00:00.000Z');
    const raw = {
      id: 'job-1', slug: 'engineer', title: 'Engineer', location: null,
      workMode: null, employmentType: null, status: 'PUBLISHED',
      moderationStatus: 'FLAGGED', deadline: null, publishedAt: date,
      company: { id: 'company-1', name: 'Northstar' },
      _count: { applications: 2, savedBy: 3 }, createdAt: date, updatedAt: date,
    };
    const listJobs = vi.fn().mockResolvedValue({ jobs: [raw], total: 1 });
    await expect(getAdminJobs(filters, { listJobs })).resolves.toMatchObject({
      items: [{ id: 'job-1', moderationLabel: 'Flagged' }],
      pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    });
    expect(listJobs).toHaveBeenCalledWith(filters);
  });
});
