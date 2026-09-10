import { getApplicantDashboard } from './applicantDashboard.service.js';

export function createGetApplicantDashboardHandler({ loadDashboard = getApplicantDashboard } = {}) {
  return async (request, response, next) => {
    try {
      return response.json({ data: await loadDashboard(request.auth.user.id) });
    } catch (error) {
      return next(error);
    }
  };
}

export const getApplicantDashboardHandler = createGetApplicantDashboardHandler();
