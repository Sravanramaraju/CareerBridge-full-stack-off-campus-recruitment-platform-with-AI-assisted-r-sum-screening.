import { describe, expect, it, vi } from 'vitest';
import { getApplicantDashboard } from '../src/modules/dashboard/applicantDashboard.service.js';

const database = { marker: 'transaction-client' };
const now = new Date('2026-09-10T00:00:00.000Z');
const profile = {
  id: 'profile-1', headline: 'Engineer', phone: null, location: 'Bengaluru', summary: 'Summary',
  preferredLocations: [], preferredJobTypes: [], preferredWorkModes: [], createdAt: now, updatedAt: now,
  user: { id: 'applicant-1', name: 'Ananya', email: 'ananya@example.com' },
  applicantEducations: [], experiences: [], projects: [], certifications: [], skills: [], resumes: [],
};

function job(id) {
  return {
    id, slug: id, companyId: 'company-1', title: 'Engineer', department: null, category: null,
    location: 'Remote', workMode: 'REMOTE', employmentType: 'FULL_TIME', openings: 1,
    experienceMin: 0, experienceMax: 0, salaryMin: null, salaryMax: null, currency: 'INR',
    hideSalary: false, summary: null, description: null, responsibilities: [], qualification: null,
    featured: false, status: 'PUBLISHED', deadline: now, publishedAt: now, createdAt: now,
    company: {
      id: 'company-1', slug: 'northstar', name: 'Northstar', brandInitials: 'NL',
      brandColor: '#2658d8', logoUrl: null, verificationStatus: 'VERIFIED',
    },
    skills: [], screeningQuestions: [],
  };
}

describe('applicant dashboard service', () => {
  it('composes all applicant dashboard panels in one response', async () => {
    const calculateMatch = vi.fn().mockReturnValue({ overallScore: 80 });
    const loadDashboard = vi.fn().mockResolvedValue({
      profile,
      applicationCounts: [{ status: 'APPLIED', _count: { _all: 2 } }],
      recentApplications: [],
      savedJobs: [{ createdAt: now, job: job('saved-job') }],
      recommendedJobs: [job('recommended-job')],
      unreadCount: 3,
    });
    const result = await getApplicantDashboard('applicant-1', {
      runTransaction: (operation) => operation(database),
      loadDashboard,
      calculateMatch,
      now: () => now,
    });
    expect(loadDashboard).toHaveBeenCalledWith('applicant-1', now, database);
    expect(result).toMatchObject({
      user: { id: 'applicant-1', name: 'Ananya' },
      applicationCounts: { APPLIED: 2, INTERVIEW: 0 },
      savedJobs: [{ id: 'saved-job', savedAt: now }],
      recommendedJobs: [{ job: { id: 'recommended-job' }, match: { overallScore: 80 } }],
      notifications: { unreadCount: 3 },
      generatedAt: now,
    });
    expect(calculateMatch).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'recommended-job' }), profile,
      { semanticScore: null, now },
    );
  });

  it('fails safely if the authenticated applicant profile is missing', async () => {
    await expect(getApplicantDashboard('applicant-1', {
      runTransaction: (operation) => operation(database),
      loadDashboard: vi.fn().mockResolvedValue({ profile: null }),
      now: () => now,
    })).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });
});
