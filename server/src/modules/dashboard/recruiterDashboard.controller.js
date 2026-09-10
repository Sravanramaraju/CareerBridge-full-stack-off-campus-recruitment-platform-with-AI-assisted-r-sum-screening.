import { getRecruiterDashboard } from './recruiterDashboard.service.js';

export function createGetRecruiterDashboardHandler({ loadDashboard = getRecruiterDashboard } = {}) {
  return async (request, response, next) => {
    try {
      return response.json({ data: await loadDashboard(request.auth.user.id) });
    } catch (error) {
      return next(error);
    }
  };
}

export const getRecruiterDashboardHandler = createGetRecruiterDashboardHandler();
