import { describe, expect, it, vi } from 'vitest';
import { getSettings, updateSettings } from '../src/modules/settings/settings.service.js';

const storedSettings = {
  applicationUpdates: true,
  jobRecommendations: false,
  careerResources: true,
  newApplications: true,
  candidateReminders: false,
  jobExpiryReminders: true,
  weeklySummary: false,
  updatedAt: new Date('2026-09-09T00:00:00.000Z'),
};

describe('settings service', () => {
  it('presents only applicant-visible settings', async () => {
    const result = await getSettings('applicant-1', 'APPLICANT', {
      findPreferences: vi.fn().mockResolvedValue(storedSettings),
    });

    expect(result).toMatchObject({
      applicationUpdates: true,
      jobRecommendations: false,
      careerResources: true,
    });
    expect(result).not.toHaveProperty('newApplications');
  });

  it('presents only recruiter-visible settings', async () => {
    const result = await getSettings('recruiter-1', 'RECRUITER', {
      findPreferences: vi.fn().mockResolvedValue(storedSettings),
    });

    expect(result).toMatchObject({
      newApplications: true,
      candidateReminders: false,
      jobExpiryReminders: true,
      weeklySummary: false,
    });
    expect(result).not.toHaveProperty('applicationUpdates');
  });

  it('updates fields available to the authenticated role', async () => {
    const updatePreferences = vi.fn().mockResolvedValue({
      ...storedSettings,
      applicationUpdates: false,
    });

    await updateSettings(
      'applicant-1',
      'APPLICANT',
      { applicationUpdates: false },
      { updatePreferences },
    );

    expect(updatePreferences).toHaveBeenCalledWith('applicant-1', {
      applicationUpdates: false,
    });
  });

  it('rejects cross-role preference changes', async () => {
    await expect(
      updateSettings('applicant-1', 'APPLICANT', { weeklySummary: true }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 422 });
  });
});
