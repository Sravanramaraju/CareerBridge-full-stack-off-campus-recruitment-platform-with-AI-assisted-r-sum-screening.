import { getPublicJob, getPublicJobs } from './job.service.js';

export function createListJobsHandler({ getJobs = getPublicJobs } = {}) {
  return async (request, response, next) => {
    try {
      const result = await getJobs(request.validated.query);
      return response.json({ data: result });
    } catch (error) {
      return next(error);
    }
  };
}

export function createListCompanyJobsHandler({ getJobs = getPublicJobs } = {}) {
  return async (request, response, next) => {
    try {
      const result = await getJobs(request.validated.query, {
        companyIdentifier: request.validated.params.companyId,
      });
      return response.json({ data: result });
    } catch (error) {
      return next(error);
    }
  };
}

export const listJobsHandler = createListJobsHandler();
export const listCompanyJobsHandler = createListCompanyJobsHandler();

export function createGetJobHandler({ getJob = getPublicJob } = {}) {
  return async (request, response, next) => {
    try {
      const job = await getJob(request.validated.params.jobId);
      return response.json({ data: job });
    } catch (error) {
      return next(error);
    }
  };
}

export const getJobHandler = createGetJobHandler();
