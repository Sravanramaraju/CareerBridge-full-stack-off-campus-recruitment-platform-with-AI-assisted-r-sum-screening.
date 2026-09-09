import { describe, expect, it, vi } from 'vitest';
import { getPublicJob, getPublicJobs } from '../src/modules/jobs/job.service.js';

function jobRecord() {
  return {
    id: 'job-1',
    workMode: 'HYBRID',
    employmentType: 'FULL_TIME',
    experienceMin: 0,
    experienceMax: 1,
    salaryMin: 500_000,
    salaryMax: 700_000,
    currency: 'INR',
    hideSalary: false,
    publishedAt: new Date('2026-09-01T00:00:00.000Z'),
    skills: [],
    company: {
      name: 'Northstar Labs',
      brandInitials: 'NL',
      brandColor: '#2658d8',
      verificationStatus: 'VERIFIED',
    },
  };
}

describe('public job service', () => {
  it('presents jobs with collection pagination metadata', async () => {
    const filters = { page: 2, pageSize: 6 };
    const listJobs = vi.fn().mockResolvedValue({ jobs: [jobRecord()], total: 13 });

    const result = await getPublicJobs(filters, { listJobs });

    expect(result.items[0]).toMatchObject({ id: 'job-1', salary: '₹5–7 LPA' });
    expect(result.pagination).toEqual({ page: 2, pageSize: 6, total: 13, totalPages: 3 });
  });

  it('passes an optional company identifier to the repository boundary', async () => {
    const listJobs = vi.fn().mockResolvedValue({ jobs: [], total: 0 });
    const filters = { page: 1, pageSize: 12 };

    await getPublicJobs(filters, { companyIdentifier: 'northstar-labs', listJobs });

    expect(listJobs).toHaveBeenCalledWith(
      filters,
      expect.any(Date),
      undefined,
      'northstar-labs',
    );
  });

  it('returns a presented public job detail', async () => {
    const findJob = vi.fn().mockResolvedValue(jobRecord());

    const result = await getPublicJob('job-1', { findJob });

    expect(findJob).toHaveBeenCalledWith('job-1', expect.any(Date));
    expect(result).toMatchObject({ id: 'job-1', employmentType: 'Full-time' });
  });

  it('returns not found for unavailable or non-public jobs', async () => {
    await expect(
      getPublicJob('closed-job', { findJob: vi.fn().mockResolvedValue(null) }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });
});
