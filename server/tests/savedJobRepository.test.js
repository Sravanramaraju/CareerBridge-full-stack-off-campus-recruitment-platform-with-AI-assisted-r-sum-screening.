import { describe, expect, it, vi } from 'vitest';
import {
  deleteApplicantSavedJob,
  listApplicantSavedJobs,
  upsertApplicantSavedJob,
} from '../src/modules/savedJobs/savedJob.repository.js';

describe('saved job repository', () => {
  it('lists saved jobs for one applicant in stable newest-first order', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    await listApplicantSavedJobs('applicant-1', { savedJob: { findMany } });

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { applicantId: 'applicant-1' },
      orderBy: [{ createdAt: 'desc' }, { jobId: 'asc' }],
      select: expect.objectContaining({
        createdAt: true,
        job: expect.objectContaining({ select: expect.objectContaining({ id: true, title: true }) }),
      }),
    }));
  });

  it('uses the compound key to make saving idempotent', async () => {
    const upsert = vi.fn().mockResolvedValue({ applicantId: 'applicant-1', jobId: 'job-1' });
    await upsertApplicantSavedJob('applicant-1', 'job-1', { savedJob: { upsert } });

    expect(upsert).toHaveBeenCalledWith({
      where: { applicantId_jobId: { applicantId: 'applicant-1', jobId: 'job-1' } },
      create: { applicantId: 'applicant-1', jobId: 'job-1' },
      update: {},
      select: { applicantId: true, jobId: true, createdAt: true },
    });
  });

  it('uses deleteMany so removing a missing saved job is idempotent', async () => {
    const deleteMany = vi.fn().mockResolvedValue({ count: 0 });
    await deleteApplicantSavedJob('applicant-1', 'job-1', { savedJob: { deleteMany } });
    expect(deleteMany).toHaveBeenCalledWith({
      where: { applicantId: 'applicant-1', jobId: 'job-1' },
    });
  });
});
