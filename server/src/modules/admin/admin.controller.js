import { getAdminDashboard } from './adminDashboard.service.js';

export function createGetAdminDashboardHandler({ loadDashboard = getAdminDashboard } = {}) {
  return async (_request, response, next) => {
    try {
      return response.json({ data: await loadDashboard() });
    } catch (error) {
      return next(error);
    }
  };
}

export const getAdminDashboardHandler = createGetAdminDashboardHandler();
