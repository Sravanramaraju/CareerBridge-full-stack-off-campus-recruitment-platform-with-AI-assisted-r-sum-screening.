import { describe, expect, it, vi } from 'vitest';
import {
  getApplicantSavedJobs,
  removeApplicantSavedJob,
  saveApplicantJob,
} from '../src/modules/savedJobs/savedJob.service.js';

const rawJob = {
  id: 'job-1',
  status: 'PUBLISHED',
  workMode: 'REMOTE',
  employmentType: 'FULL_TIME',
  experienceMin: 0,
  experienceMax: 1,
  salaryMin: null,
  salaryMax: null,
  currency: 'INR',
  hideSalary: false,
  skills: [],
  company: {
    name: 'Northstar Labs',
    brandInitials: 'NL',
    brandColor: '#2658d8',
    verificationStatus: 'VERIFIED',
  },
};

describe('saved job service', () => {
  it('presents persisted jobs with their saved timestamp', async () => {
    const savedAt = new Date('2026-09-10T08:00:00.000Z');
    await expect(getApplicantSavedJobs('applicant-1', {
      listSavedJobs: vi.fn().mockResolvedValue([{ createdAt: savedAt, job: rawJob }]),
    })).resolves.toEqual([
      expect.objectContaining({
        id: 'job-1',
        status: 'Published',
        savedAt,
        workMode: 'Remote',
      }),
    ]);
  });

  it('resolves only currently public jobs before saving', async () => {
    const now = new Date('2026-09-10T09:00:00.000Z');
    const findJob = vi.fn().mockResolvedValue(rawJob);
    const saveJob = vi.fn().mockResolvedValue({
      jobId: 'job-1',
      createdAt: now,
    });

    await expect(saveApplicantJob('applicant-1', 'graduate-engineer', {
      findJob,
      saveJob,
      now: () => now,
    })).resolves.toEqual({ jobId: 'job-1', savedAt: now, saved: true });
    expect(findJob).toHaveBeenCalledWith('graduate-engineer', now);
    expect(saveJob).toHaveBeenCalledWith('applicant-1', 'job-1');
  });

  it('rejects unavailable or non-public jobs without creating a saved record', async () => {
    const saveJob = vi.fn();
    await expect(saveApplicantJob('applicant-1', 'hidden-job', {
      findJob: vi.fn().mockResolvedValue(null),
      saveJob,
    })).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
    expect(saveJob).not.toHaveBeenCalled();
  });

  it('removes saved jobs idempotently', async () => {
    const deleteSavedJob = vi.fn().mockResolvedValue({ count: 0 });
    await expect(removeApplicantSavedJob('applicant-1', 'job-1', { deleteSavedJob }))
      .resolves.toEqual({ jobId: 'job-1', saved: false });
    expect(deleteSavedJob).toHaveBeenCalledWith('applicant-1', 'job-1');
  });
});
