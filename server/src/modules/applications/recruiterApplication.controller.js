import {
  getRecruiterApplication,
  getRecruiterJobApplications,
  updateRecruiterApplicationStatus,
} from './recruiterApplication.service.js';

export function createListRecruiterApplicationsHandler({
  listApplications = getRecruiterJobApplications,
} = {}) {
  return async (request, response, next) => {
    try {
      const result = await listApplications(
        request.auth.user.id,
        request.validated.params.jobId,
        request.validated.query,
      );
      return response.json({ data: result });
    } catch (error) {
      return next(error);
    }
  };
}

export function createGetRecruiterApplicationHandler({
  getApplication = getRecruiterApplication,
} = {}) {
  return async (request, response, next) => {
    try {
      const application = await getApplication(
        request.auth.user.id,
        request.validated.params.applicationId,
      );
      return response.json({ data: application });
    } catch (error) {
      return next(error);
    }
  };
}

export function createUpdateRecruiterApplicationStatusHandler({
  updateStatus = updateRecruiterApplicationStatus,
} = {}) {
  return async (request, response, next) => {
    try {
      const application = await updateStatus(
        request.auth.user.id,
        request.validated.params.applicationId,
        request.validated.body,
      );
      return response.json({ data: application });
    } catch (error) {
      return next(error);
    }
  };
}

export const listRecruiterApplicationsHandler = createListRecruiterApplicationsHandler();
export const getRecruiterApplicationHandler = createGetRecruiterApplicationHandler();
export const updateRecruiterApplicationStatusHandler =
  createUpdateRecruiterApplicationStatusHandler();
