import { describe, expect, it, vi } from 'vitest';
import {
  findRecruiterApplicationDetail,
  listRecruiterJobApplicationCandidates,
} from '../src/modules/applications/recruiterApplication.repository.js';

describe('recruiter application repository', () => {
  it('loads candidate evidence and match data without per-candidate queries', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    await listRecruiterJobApplicationCandidates('job-1', {
      minMatch: 0, page: 1, pageSize: 20,
    }, { application: { findMany } });
    const query = findMany.mock.calls[0][0];
    expect(query.where).toEqual({ jobId: 'job-1' });
    expect(query.select.applicant.select.applicantProfile.select).toHaveProperty('experiences');
    expect(query.select.applicant.select.applicantProfile.select).toHaveProperty('skills');
    expect(query.select).toHaveProperty('match');
  });

  it('applies status, match, and location filters at the database boundary', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    await listRecruiterJobApplicationCandidates('job-1', {
      status: 'SHORTLISTED',
      minMatch: 80,
      location: 'Bengaluru',
      page: 1,
      pageSize: 20,
    }, { application: { findMany } });
    expect(findMany.mock.calls[0][0].where).toMatchObject({
      jobId: 'job-1',
      status: 'SHORTLISTED',
      match: { is: { overallScore: { gte: 80 } } },
      AND: [{
        applicant: {
          is: {
            applicantProfile: {
              is: { location: { contains: 'Bengaluru', mode: 'insensitive' } },
            },
          },
        },
      }],
    });
  });

  it('searches candidate names, headlines, and normalized skill relations', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    await listRecruiterJobApplicationCandidates('job-1', {
      q: 'react', minMatch: 0, page: 1, pageSize: 20,
    }, { application: { findMany } });
    const search = findMany.mock.calls[0][0].where.AND[0].applicant.is.OR;
    expect(search).toHaveLength(3);
    expect(search[0]).toEqual({ name: { contains: 'react', mode: 'insensitive' } });
  });

  it('combines text and location filters instead of overwriting either one', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    await listRecruiterJobApplicationCandidates('job-1', {
      q: 'react', location: 'Pune', minMatch: 0, page: 1, pageSize: 20,
    }, { application: { findMany } });
    expect(findMany.mock.calls[0][0].where.AND).toHaveLength(2);
  });

  it('loads a complete candidate detail through company ownership in one query', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    await findRecruiterApplicationDetail('application-1', 'company-1', {
      application: { findFirst },
    });
    const query = findFirst.mock.calls[0][0];
    expect(query.where).toEqual({
      id: 'application-1',
      job: { is: { companyId: 'company-1' } },
    });
    expect(query.select.applicant.select.applicantProfile.select).toMatchObject({
      applicantEducations: expect.any(Object),
      experiences: expect.any(Object),
      projects: expect.any(Object),
      certifications: expect.any(Object),
      skills: expect.any(Object),
    });
    expect(query.select).toHaveProperty('resume');
    expect(query.select).toHaveProperty('match');
    expect(query.select).toHaveProperty('statusHistory');
    expect(query.select).toHaveProperty('recruiterNotes');
    expect(JSON.stringify(query.select)).not.toContain('passwordHash');
    expect(JSON.stringify(query.select)).not.toContain('sessions');
  });
});
