import { submitJobApplication } from './application.service.js';

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
