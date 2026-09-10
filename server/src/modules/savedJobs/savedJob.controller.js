import {
  getApplicantSavedJobs,
  removeApplicantSavedJob,
  saveApplicantJob,
} from './savedJob.service.js';

export function createListSavedJobsHandler({ listSavedJobs = getApplicantSavedJobs } = {}) {
  return async (request, response, next) => {
    try {
      return response.json({ data: await listSavedJobs(request.auth.user.id) });
    } catch (error) {
      return next(error);
    }
  };
}

export function createSaveJobHandler({ saveJob = saveApplicantJob } = {}) {
  return async (request, response, next) => {
    try {
      const result = await saveJob(request.auth.user.id, request.validated.params.jobId);
      return response.json({ data: result });
    } catch (error) {
      return next(error);
    }
  };
}

export function createRemoveSavedJobHandler({ removeSavedJob = removeApplicantSavedJob } = {}) {
  return async (request, response, next) => {
    try {
      const result = await removeSavedJob(
        request.auth.user.id,
        request.validated.params.jobId,
      );
      return response.json({ data: result });
    } catch (error) {
      return next(error);
    }
  };
}

export const listSavedJobsHandler = createListSavedJobsHandler();
export const saveJobHandler = createSaveJobHandler();
export const removeSavedJobHandler = createRemoveSavedJobHandler();
