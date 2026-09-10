import { describe, expect, it, vi } from 'vitest';
import { listRecruiterJobApplicationCandidates } from '../src/modules/applications/recruiterApplication.repository.js';

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
});
