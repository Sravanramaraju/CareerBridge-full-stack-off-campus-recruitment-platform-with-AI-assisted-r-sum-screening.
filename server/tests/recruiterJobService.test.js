import { describe, expect, it, vi } from 'vitest';
import {
  createRecruiterJobDraft,
  getRecruiterJob,
  getRecruiterJobs,
  publishRecruiterJob,
  updateRecruiterJobDraft,
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

  it('updates owned draft fields and replaces supplied relations', async () => {
    const database = { marker: 'transaction-client' };
    const updateJob = vi.fn().mockResolvedValue({ count: 1 });
    const deleteSkills = vi.fn().mockResolvedValue({ count: 1 });
    const createSkills = vi.fn().mockResolvedValue({ count: 1 });
    const deleteQuestions = vi.fn().mockResolvedValue({ count: 1 });
    const createQuestions = vi.fn().mockResolvedValue({ count: 1 });
    const findJob = vi.fn()
      .mockResolvedValueOnce({
        id: 'job-1', status: 'DRAFT', experienceMin: 0, experienceMax: 2,
        salaryMin: null, salaryMax: null,
      })
      .mockResolvedValueOnce({ id: 'job-1', title: 'Updated role' });

    const result = await updateRecruiterJobDraft('recruiter-1', 'job-1', {
      title: 'Updated role',
      skills: [{ name: 'React', requirement: 'REQUIRED' }],
      screeningQuestions: [{ question: 'Can you start in October?', required: true }],
    }, {
      runTransaction: (operation) => operation(database),
      findMembership: vi.fn().mockResolvedValue(membership),
      findJob,
      updateJob,
      upsertSkill: vi.fn().mockResolvedValue({ id: 'skill-react' }),
      deleteSkills,
      createSkills,
      deleteQuestions,
      createQuestions,
    });

    expect(updateJob).toHaveBeenCalledWith(
      'job-1', 'company-1', { title: 'Updated role' }, database,
    );
    expect(deleteSkills).toHaveBeenCalledWith('job-1', database);
    expect(createSkills).toHaveBeenCalledWith(
      'job-1', [{ skillId: 'skill-react', requirement: 'REQUIRED' }], database,
    );
    expect(deleteQuestions).toHaveBeenCalledWith('job-1', database);
    expect(result).toMatchObject({ title: 'Updated role' });
  });

  it('validates partial ranges against the stored draft', async () => {
    await expect(updateRecruiterJobDraft('recruiter-1', 'job-1', {
      experienceMax: 1,
    }, {
      runTransaction: (operation) => operation({}),
      findMembership: vi.fn().mockResolvedValue(membership),
      findJob: vi.fn().mockResolvedValue({
        status: 'DRAFT', experienceMin: 3, experienceMax: 5, salaryMin: null, salaryMax: null,
      }),
    })).rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 422 });
  });

  it('returns edited published jobs to moderation review', async () => {
    const updateJob = vi.fn().mockResolvedValue({ count: 1 });
    const findJob = vi.fn()
      .mockResolvedValueOnce({
        status: 'PUBLISHED', experienceMin: 0, experienceMax: 1,
        salaryMin: null, salaryMax: null,
      })
      .mockResolvedValueOnce({ id: 'job-1' });

    await updateRecruiterJobDraft('recruiter-1', 'job-1', { title: 'New public title' }, {
      runTransaction: (operation) => operation({}),
      findMembership: vi.fn().mockResolvedValue(membership),
      findJob,
      updateJob,
    });

    expect(updateJob).toHaveBeenCalledWith(
      'job-1', 'company-1', { title: 'New public title', moderationStatus: 'PENDING' }, {},
    );
  });

  it('publishes a complete draft for a verified recruiter company', async () => {
    const database = { marker: 'transaction-client' };
    const publishedAt = new Date('2026-09-10T08:00:00.000Z');
    const draft = { id: 'job-1', status: 'DRAFT' };
    const published = { ...draft, status: 'PUBLISHED', publishedAt };
    const findJob = vi.fn().mockResolvedValueOnce(draft).mockResolvedValueOnce(published);
    const transitionJob = vi.fn().mockResolvedValue({ count: 1 });
    const assertReady = vi.fn();

    const result = await publishRecruiterJob('recruiter-1', 'job-1', {
      runTransaction: (operation) => operation(database),
      findMembership: vi.fn().mockResolvedValue(membership),
      findJob,
      transitionJob,
      assertReady,
      now: () => publishedAt,
    });

    expect(assertReady).toHaveBeenCalledWith(draft, publishedAt);
    expect(transitionJob).toHaveBeenCalledWith('job-1', 'company-1', ['DRAFT'], {
      status: 'PUBLISHED',
      moderationStatus: 'PENDING',
      publishedAt,
      closedAt: null,
    }, database);
    expect(result).toEqual(published);
  });

  it('prevents unverified companies from publishing jobs', async () => {
    await expect(publishRecruiterJob('recruiter-1', 'job-1', {
      runTransaction: (operation) => operation({}),
      findMembership: vi.fn().mockResolvedValue({
        company: { id: 'company-1', verificationStatus: 'PENDING' },
      }),
    })).rejects.toMatchObject({ code: 'COMPANY_NOT_VERIFIED', status: 403 });
  });

  it('prevents publishing from a non-draft lifecycle state', async () => {
    await expect(publishRecruiterJob('recruiter-1', 'job-1', {
      runTransaction: (operation) => operation({}),
      findMembership: vi.fn().mockResolvedValue(membership),
      findJob: vi.fn().mockResolvedValue({ id: 'job-1', status: 'CLOSED' }),
    })).rejects.toMatchObject({ code: 'INVALID_JOB_STATE', status: 409 });
  });

  it('detects concurrent publication attempts without overwriting state', async () => {
    await expect(publishRecruiterJob('recruiter-1', 'job-1', {
      runTransaction: (operation) => operation({}),
      findMembership: vi.fn().mockResolvedValue(membership),
      findJob: vi.fn().mockResolvedValue({ id: 'job-1', status: 'DRAFT' }),
      assertReady: vi.fn(),
      transitionJob: vi.fn().mockResolvedValue({ count: 0 }),
    })).rejects.toMatchObject({ code: 'INVALID_JOB_STATE', status: 409 });
  });
});
