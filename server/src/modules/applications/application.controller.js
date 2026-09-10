import {
  getApplicantApplication,
  getApplicantApplications,
} from './applicantApplication.service.js';
import { submitJobApplication } from './application.service.js';

export function createListApplicantApplicationsHandler({
  listApplications = getApplicantApplications,
} = {}) {
  return async (request, response, next) => {
    try {
      return response.json({ data: await listApplications(request.auth.user.id) });
    } catch (error) {
      return next(error);
    }
  };
}

export function createGetApplicantApplicationHandler({
  getApplication = getApplicantApplication,
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

export function createSubmitApplicationHandler({ submitApplication = submitJobApplication } = {}) {
  return async (request, response, next) => {
    try {
      const application = await submitApplication(
        request.auth.user.id,
        request.validated.params.jobId,
        request.validated.body,
      );
      return response.status(201).json({ data: application });
    } catch (error) {
      return next(error);
    }
  };
}

export const submitApplicationHandler = createSubmitApplicationHandler();
export const listApplicantApplicationsHandler = createListApplicantApplicationsHandler();
export const getApplicantApplicationHandler = createGetApplicantApplicationHandler();
