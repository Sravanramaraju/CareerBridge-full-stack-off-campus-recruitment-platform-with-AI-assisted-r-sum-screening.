import { describe, expect, it, vi } from 'vitest';
import { getAdminJobs, moderateJob } from '../src/modules/admin/adminJob.service.js';

const database = { marker: 'transaction-client' };
const date = new Date('2026-09-10T00:00:00.000Z');

function job(moderationStatus = 'PENDING') {
  return {
    id: 'job-1', slug: 'engineer', title: 'Engineer', location: null,
    workMode: null, employmentType: null, status: 'PUBLISHED', moderationStatus,
    deadline: null, publishedAt: date, company: { id: 'company-1', name: 'Northstar' },
    _count: { applications: 2, savedBy: 3 }, createdAt: date, updatedAt: date,
  };
}

describe('admin job service', () => {
  it('presents and paginates the job moderation queue', async () => {
    const filters = { moderationStatus: 'FLAGGED', page: 1, pageSize: 20 };
    const listJobs = vi.fn().mockResolvedValue({ jobs: [job('FLAGGED')], total: 1 });
    await expect(getAdminJobs(filters, { listJobs })).resolves.toMatchObject({
      items: [{ id: 'job-1', moderationLabel: 'Flagged' }],
      pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    });
    expect(listJobs).toHaveBeenCalledWith(filters);
  });

  it('updates job moderation, audits it, and notifies company recruiters atomically', async () => {
    const findJob = vi.fn().mockResolvedValueOnce(job()).mockResolvedValueOnce(job('FLAGGED'));
    const updateModeration = vi.fn().mockResolvedValue({ count: 1 });
    const writeAudit = vi.fn().mockResolvedValue({ id: 'audit-1' });
    const createNotifications = vi.fn().mockResolvedValue({ count: 1 });
    await expect(moderateJob(
      'admin-1', 'job-1', { action: 'FLAG', reason: 'Review compensation claims.' },
      { requestId: 'request-1' },
      {
        runTransaction: (operation) => operation(database),
        findJob,
        updateModeration,
        writeAudit,
        listRecruiters: vi.fn().mockResolvedValue([{ user: { id: 'recruiter-1' } }]),
        createNotifications,
      },
    )).resolves.toMatchObject({ moderationStatus: 'FLAGGED', status: 'PUBLISHED' });
    expect(updateModeration).toHaveBeenCalledWith(
      'job-1', 'PENDING', 'FLAGGED', database,
    );
    expect(writeAudit).toHaveBeenCalledWith(expect.objectContaining({
      action: 'JOB_MODERATION_CHANGED',
      metadata: { from: 'PENDING', to: 'FLAGGED', reason: 'Review compensation claims.' },
    }), database);
    expect(createNotifications).toHaveBeenCalledWith([expect.objectContaining({
      userId: 'recruiter-1', type: 'JOB_MODERATION_CHANGED', entityId: 'job-1',
    })], database);
  });

  it('keeps repeated job moderation actions idempotent', async () => {
    const updateModeration = vi.fn();
    await moderateJob('admin-1', 'job-1', { action: 'CLEAR' }, {}, {
      runTransaction: (operation) => operation(database),
      findJob: vi.fn().mockResolvedValue(job('CLEARED')),
      updateModeration,
    });
    expect(updateModeration).not.toHaveBeenCalled();
  });

  it('detects concurrent moderation before audit writes', async () => {
    const writeAudit = vi.fn();
    await expect(moderateJob('admin-1', 'job-1', { action: 'CLEAR' }, {}, {
      runTransaction: (operation) => operation(database),
      findJob: vi.fn().mockResolvedValue(job()),
      updateModeration: vi.fn().mockResolvedValue({ count: 0 }),
      writeAudit,
    })).rejects.toMatchObject({ code: 'ADMIN_MODERATION_CONFLICT', status: 409 });
    expect(writeAudit).not.toHaveBeenCalled();
  });
});
