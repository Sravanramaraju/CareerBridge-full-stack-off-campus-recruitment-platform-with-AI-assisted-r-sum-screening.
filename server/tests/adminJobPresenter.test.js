import { describe, expect, it } from 'vitest';
import { toAdminJob } from '../src/modules/admin/adminJob.presenter.js';

describe('admin job presenter', () => {
  it('keeps lifecycle and moderation states distinct while flattening counts', () => {
    const date = new Date('2026-09-10T00:00:00.000Z');
    expect(toAdminJob({
      id: 'job-1', slug: 'engineer', title: 'Engineer', location: 'Remote',
      workMode: 'REMOTE', employmentType: 'FULL_TIME', status: 'PUBLISHED',
      moderationStatus: 'FLAGGED', deadline: date, publishedAt: date,
      company: { id: 'company-1', name: 'Northstar' },
      _count: { applications: 20, savedBy: 8 }, createdAt: date, updatedAt: date,
    })).toMatchObject({
      id: 'job-1', status: 'PUBLISHED', statusLabel: 'Published',
      moderationStatus: 'FLAGGED', moderationLabel: 'Flagged',
      applicationCount: 20, savedCount: 8,
    });
  });
});
