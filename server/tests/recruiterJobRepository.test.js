import { describe, expect, it, vi } from 'vitest';
import {
  createRecruiterJob,
  findOwnedRecruiterJob,
  listRecruiterJobs,
  updateOwnedRecruiterJob,
} from '../src/modules/jobs/recruiterJob.repository.js';

describe('recruiter job repository', () => {
  it('lists every lifecycle state only for the recruiter company', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    await listRecruiterJobs('company-1', { job: { findMany } });

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { companyId: 'company-1' },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    }));
    expect(findMany.mock.calls[0][0].select).toHaveProperty('moderationStatus', true);
    expect(findMany.mock.calls[0][0].select._count).toEqual({
      select: { applications: true },
    });
  });

  it('creates draft records with canonical ownership', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'job-1' });
    const data = { slug: 'graduate-engineer-abc123', title: 'Graduate Engineer' };
    await createRecruiterJob('company-1', 'recruiter-1', data, { job: { create } });

    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      data: { ...data, companyId: 'company-1', createdByUserId: 'recruiter-1' },
    }));
  });

  it('scopes job reads and updates by company ownership', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const database = { job: { findFirst, updateMany } };

    await findOwnedRecruiterJob('job-1', 'company-1', database);
    await updateOwnedRecruiterJob('job-1', 'company-1', { title: 'Updated' }, database);

    expect(findFirst.mock.calls[0][0].where).toEqual({ id: 'job-1', companyId: 'company-1' });
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 'job-1', companyId: 'company-1' },
      data: { title: 'Updated' },
    });
  });
});
