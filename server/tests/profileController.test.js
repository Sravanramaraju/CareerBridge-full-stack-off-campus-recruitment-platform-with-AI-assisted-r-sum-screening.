import { describe, expect, it, vi } from 'vitest';
import {
  createGetApplicantProfileHandler,
  createUpdateApplicantProfileHandler,
} from '../src/modules/profiles/profile.controller.js';

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

  it('updates the authenticated applicant with validated profile input', async () => {
    const body = { headline: 'Frontend developer' };
    const profile = { id: 'profile-1', ...body };
    const updateProfile = vi.fn().mockResolvedValue(profile);
    const response = { json: vi.fn((value) => value) };

    await createUpdateApplicantProfileHandler({ updateProfile })(
      {
        auth: { user: { id: 'applicant-1' } },
        validated: { body },
      },
      response,
      vi.fn(),
    );

    expect(updateProfile).toHaveBeenCalledWith('applicant-1', body);
    expect(response.json).toHaveBeenCalledWith({ data: profile });
  });
});
