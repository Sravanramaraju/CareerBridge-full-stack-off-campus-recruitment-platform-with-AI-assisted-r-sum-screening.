import {
  archiveRecruiterJob,
  closeRecruiterJob,
  createRecruiterJobDraft,
  getRecruiterJob,
  getRecruiterJobs,
  publishRecruiterJob,
  reopenRecruiterJob,
  updateRecruiterJobDraft,
} from './recruiterJob.service.js';

export function createListRecruiterJobsHandler({ listJobs = getRecruiterJobs } = {}) {
  return async (request, response, next) => {
    try {
      return response.json({ data: await listJobs(request.auth.user.id) });
    } catch (error) {
      return next(error);
    }
  };
}

export function createGetRecruiterJobHandler({ getJob = getRecruiterJob } = {}) {
  return async (request, response, next) => {
    try {
      const job = await getJob(request.auth.user.id, request.validated.params.jobId);
      return response.json({ data: job });
    } catch (error) {
      return next(error);
    }
  };
}

export function createCreateRecruiterJobHandler({ createJob = createRecruiterJobDraft } = {}) {
  return async (request, response, next) => {
    try {
      const job = await createJob(request.auth.user.id, request.validated.body);
      return response.status(201).json({ data: job });
    } catch (error) {
      return next(error);
    }
  };
}

export function createUpdateRecruiterJobHandler({ updateJob = updateRecruiterJobDraft } = {}) {
  return async (request, response, next) => {
    try {
      const job = await updateJob(
        request.auth.user.id,
        request.validated.params.jobId,
        request.validated.body,
      );
      return response.json({ data: job });
    } catch (error) {
      return next(error);
    }
  };
}

function createLifecycleHandler(action) {
  return ({ changeJob = action } = {}) => async (request, response, next) => {
    try {
      const job = await changeJob(request.auth.user.id, request.validated.params.jobId);
      return response.json({ data: job });
    } catch (error) {
      return next(error);
    }
  };
}

export const createPublishRecruiterJobHandler = createLifecycleHandler(publishRecruiterJob);
export const createCloseRecruiterJobHandler = createLifecycleHandler(closeRecruiterJob);
export const createReopenRecruiterJobHandler = createLifecycleHandler(reopenRecruiterJob);
export const createArchiveRecruiterJobHandler = createLifecycleHandler(archiveRecruiterJob);

export const listRecruiterJobsHandler = createListRecruiterJobsHandler();
export const getRecruiterJobHandler = createGetRecruiterJobHandler();
export const createRecruiterJobHandler = createCreateRecruiterJobHandler();
export const updateRecruiterJobHandler = createUpdateRecruiterJobHandler();
export const publishRecruiterJobHandler = createPublishRecruiterJobHandler();
export const closeRecruiterJobHandler = createCloseRecruiterJobHandler();
export const reopenRecruiterJobHandler = createReopenRecruiterJobHandler();
export const archiveRecruiterJobHandler = createArchiveRecruiterJobHandler();
