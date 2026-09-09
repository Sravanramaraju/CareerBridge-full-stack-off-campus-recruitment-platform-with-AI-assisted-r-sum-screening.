import { describe, expect, it, vi } from 'vitest';
import {
  createRecruiterJobDraft,
  getRecruiterJob,
  getRecruiterJobs,
} from '../src/modules/jobs/recruiterJob.service.js';

const membership = { company: { id: 'company-1', verificationStatus: 'VERIFIED' } };

describe('recruiter job service', () => {
  it('lists jobs only through the authenticated company membership', async () => {
    const listJobs = vi.fn().mockResolvedValue([{ id: 'job-1' }]);
    await expect(getRecruiterJobs('recruiter-1', {
      findMembership: vi.fn().mockResolvedValue(membership),
      listJobs,
    })).resolves.toEqual([{ id: 'job-1' }]);
    expect(listJobs).toHaveBeenCalledWith('company-1');
  });

  it('returns a generic not-found response for foreign company jobs', async () => {
    await expect(getRecruiterJob('recruiter-1', 'foreign-job', {
      findMembership: vi.fn().mockResolvedValue(membership),
      findJob: vi.fn().mockResolvedValue(null),
    })).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });

  it('creates a draft with normalized skills and ordered questions atomically', async () => {
    const database = { marker: 'transaction-client' };
    const createJob = vi.fn().mockResolvedValue({ id: 'job-1' });
    const upsertSkill = vi.fn().mockResolvedValue({ id: 'skill-react' });
    const createSkills = vi.fn().mockResolvedValue({ count: 1 });
    const createQuestions = vi.fn().mockResolvedValue({ count: 1 });
    const input = {
      title: 'Graduate Engineer',
      skills: [{ name: 'React', requirement: 'REQUIRED' }],
      screeningQuestions: [{ question: 'Can you work in Bengaluru?', required: true }],
    };

    const result = await createRecruiterJobDraft('recruiter-1', input, {
      runTransaction: (operation) => operation(database),
      findMembership: vi.fn().mockResolvedValue(membership),
      createJob,
      findJob: vi.fn().mockResolvedValue({ id: 'job-1', status: 'DRAFT' }),
      upsertSkill,
      createSkills,
      createQuestions,
      slugFactory: () => 'graduate-engineer-1234567890',
    });

    expect(createJob).toHaveBeenCalledWith('company-1', 'recruiter-1', {
      title: 'Graduate Engineer',
      slug: 'graduate-engineer-1234567890',
      status: 'DRAFT',
      moderationStatus: 'PENDING',
    }, database);
    expect(upsertSkill).toHaveBeenCalledWith({ name: 'React', normalizedName: 'react' }, database);
    expect(createSkills).toHaveBeenCalledWith(
      'job-1',
      [{ skillId: 'skill-react', requirement: 'REQUIRED' }],
      database,
    );
    expect(createQuestions).toHaveBeenCalledWith('job-1', input.screeningQuestions, database);
    expect(result).toMatchObject({ id: 'job-1', status: 'DRAFT' });
  });

  it('requires company membership before creating a draft', async () => {
    await expect(createRecruiterJobDraft('recruiter-1', {
      title: 'Draft', skills: [], screeningQuestions: [],
    }, {
      runTransaction: (operation) => operation({}),
      findMembership: vi.fn().mockResolvedValue(null),
    })).rejects.toMatchObject({ code: 'COMPANY_MEMBERSHIP_REQUIRED', status: 403 });
  });
});
