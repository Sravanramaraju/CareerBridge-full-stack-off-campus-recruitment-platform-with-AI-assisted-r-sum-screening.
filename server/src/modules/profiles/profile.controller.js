import { getApplicantProfile, updateApplicantProfile } from './profile.service.js';

export function createGetApplicantProfileHandler({ getProfile = getApplicantProfile } = {}) {
  return async (request, response, next) => {
    try {
      const profile = await getProfile(request.auth.user.id);
      return response.json({ data: profile });
    } catch (error) {
      return next(error);
    }
  };
}

export const getApplicantProfileHandler = createGetApplicantProfileHandler();

export function createUpdateApplicantProfileHandler({ updateProfile = updateApplicantProfile } = {}) {
  return async (request, response, next) => {
    try {
      const profile = await updateProfile(request.auth.user.id, request.validated.body);
      return response.json({ data: profile });
    } catch (error) {
      return next(error);
    }
  };
}

export const updateApplicantProfileHandler = createUpdateApplicantProfileHandler();
