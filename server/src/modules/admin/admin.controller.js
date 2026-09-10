import {
  getAdminCompanies,
  moderateCompanyVerification,
} from './adminCompany.service.js';
import { getAdminDashboard } from './adminDashboard.service.js';
import { getAdminJobs, moderateJob } from './adminJob.service.js';
import { getAdminUsers, moderateUserStatus } from './adminUser.service.js';

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

export function createListAdminJobsHandler({ listJobs = getAdminJobs } = {}) {
  return async (request, response, next) => {
    try {
      return response.json({ data: await listJobs(request.validated.query) });
    } catch (error) {
      return next(error);
    }
  };
}

export function createModerateJobHandler({ moderateJobRecord = moderateJob } = {}) {
  return async (request, response, next) => {
    try {
      const job = await moderateJobRecord(
        request.auth.user.id,
        request.validated.params.jobId,
        request.validated.body,
        auditContext(request),
      );
      return response.json({ data: job });
    } catch (error) {
      return next(error);
    }
  };
}

export function createListAdminUsersHandler({ listUsers = getAdminUsers } = {}) {
  return async (request, response, next) => {
    try {
      return response.json({ data: await listUsers(request.validated.query) });
    } catch (error) {
      return next(error);
    }
  };
}

export function createModerateUserHandler({ moderateUser = moderateUserStatus } = {}) {
  return async (request, response, next) => {
    try {
      const user = await moderateUser(
        request.auth.user.id,
        request.validated.params.userId,
        request.validated.body,
        auditContext(request),
      );
      return response.json({ data: user });
    } catch (error) {
      return next(error);
    }
  };
}

export const getAdminDashboardHandler = createGetAdminDashboardHandler();
export const listAdminCompaniesHandler = createListAdminCompaniesHandler();
export const moderateCompanyHandler = createModerateCompanyHandler();
export const listAdminJobsHandler = createListAdminJobsHandler();
export const moderateJobHandler = createModerateJobHandler();
export const listAdminUsersHandler = createListAdminUsersHandler();
export const moderateUserHandler = createModerateUserHandler();
