import {
  getAdminCompanies,
  moderateCompanyVerification,
} from './adminCompany.service.js';
import { getAdminDashboard } from './adminDashboard.service.js';

function auditContext(request) {
  return { requestId: request.id, ipAddress: request.ip };
}

export function createGetAdminDashboardHandler({ loadDashboard = getAdminDashboard } = {}) {
  return async (_request, response, next) => {
    try {
      return response.json({ data: await loadDashboard() });
    } catch (error) {
      return next(error);
    }
  };
}

export function createListAdminCompaniesHandler({ listCompanies = getAdminCompanies } = {}) {
  return async (request, response, next) => {
    try {
      return response.json({ data: await listCompanies(request.validated.query) });
    } catch (error) {
      return next(error);
    }
  };
}

export function createModerateCompanyHandler({
  moderateCompany = moderateCompanyVerification,
} = {}) {
  return async (request, response, next) => {
    try {
      const company = await moderateCompany(
        request.auth.user.id,
        request.validated.params.companyId,
        request.validated.body,
        auditContext(request),
      );
      return response.json({ data: company });
    } catch (error) {
      return next(error);
    }
  };
}

export const getAdminDashboardHandler = createGetAdminDashboardHandler();
export const listAdminCompaniesHandler = createListAdminCompaniesHandler();
export const moderateCompanyHandler = createModerateCompanyHandler();
