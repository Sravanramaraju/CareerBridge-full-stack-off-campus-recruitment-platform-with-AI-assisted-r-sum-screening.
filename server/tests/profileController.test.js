import { describe, expect, it, vi } from 'vitest';
import { createGetApplicantProfileHandler } from '../src/modules/profiles/profile.controller.js';

describe('applicant profile controller', () => {
  it('returns the profile for the authenticated applicant identity', async () => {
    const profile = { id: 'profile-1', name: 'Ananya Rao' };
    const getProfile = vi.fn().mockResolvedValue(profile);
    const response = { json: vi.fn((body) => body) };

    await createGetApplicantProfileHandler({ getProfile })(
      { auth: { user: { id: 'applicant-1' } } },
      response,
      vi.fn(),
    );

    expect(getProfile).toHaveBeenCalledWith('applicant-1');
    expect(response.json).toHaveBeenCalledWith({ data: profile });
  });

  it('forwards profile service failures to central error handling', async () => {
    const error = new Error('profile query failed');
    const next = vi.fn();

    await createGetApplicantProfileHandler({
      getProfile: vi.fn().mockRejectedValue(error),
    })({ auth: { user: { id: 'applicant-1' } } }, { json: vi.fn() }, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
