import { describe, expect, it, vi } from 'vitest';
import {
  createJobScreeningQuestions,
  createJobSkills,
  createRecruiterJob,
  deleteJobScreeningQuestions,
  deleteJobSkills,
  findOwnedRecruiterJob,
  listRecruiterJobs,
  transitionOwnedRecruiterJob,
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

  it('guards lifecycle writes with ownership and expected source states', async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const database = { job: { updateMany } };

    await transitionOwnedRecruiterJob(
      'job-1',
      'company-1',
      ['DRAFT', 'CLOSED'],
      { status: 'PUBLISHED' },
      database,
    );

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: 'job-1',
        companyId: 'company-1',
        status: { in: ['DRAFT', 'CLOSED'] },
      },
      data: { status: 'PUBLISHED' },
    });
  });

  it('replaces normalized job skill links', async () => {
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
    const createMany = vi.fn().mockResolvedValue({ count: 2 });
    const database = { jobSkill: { deleteMany, createMany } };

    await deleteJobSkills('job-1', database);
    await createJobSkills('job-1', [
      { skillId: 'skill-react', requirement: 'REQUIRED' },
      { skillId: 'skill-testing', requirement: 'PREFERRED' },
    ], database);

    expect(deleteMany).toHaveBeenCalledWith({ where: { jobId: 'job-1' } });
    expect(createMany).toHaveBeenCalledWith({
      data: [
        { jobId: 'job-1', skillId: 'skill-react', requirement: 'REQUIRED' },
        { jobId: 'job-1', skillId: 'skill-testing', requirement: 'PREFERRED' },
      ],
    });
  });

  it('replaces screening questions in stable form order', async () => {
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
    const createMany = vi.fn().mockResolvedValue({ count: 2 });
    const database = { jobScreeningQuestion: { deleteMany, createMany } };

    await deleteJobScreeningQuestions('job-1', database);
    await createJobScreeningQuestions('job-1', [
      { question: 'Are you available?', required: true },
      { question: 'When can you start?', required: false },
    ], database);

    expect(deleteMany).toHaveBeenCalledWith({ where: { jobId: 'job-1' } });
    expect(createMany).toHaveBeenCalledWith({
      data: [
        { jobId: 'job-1', question: 'Are you available?', required: true, sortOrder: 0 },
        { jobId: 'job-1', question: 'When can you start?', required: false, sortOrder: 1 },
      ],
    });
  });

  it('skips empty relation createMany queries', async () => {
    await expect(createJobSkills('job-1', [], {})).resolves.toEqual({ count: 0 });
    await expect(createJobScreeningQuestions('job-1', [], {})).resolves.toEqual({ count: 0 });
  });
});
