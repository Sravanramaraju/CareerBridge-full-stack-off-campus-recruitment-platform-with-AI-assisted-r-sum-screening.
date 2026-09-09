import {
  getRecruiterCompany,
  updateRecruiterCompany,
} from './company.service.js';

export function createGetRecruiterCompanyHandler({ getCompany = getRecruiterCompany } = {}) {
  return async (request, response, next) => {
    try {
      const company = await getCompany(request.auth.user.id);
      return response.json({ data: company });
    } catch (error) {
      return next(error);
    }
  };
}

export function createUpdateRecruiterCompanyHandler({ updateCompany = updateRecruiterCompany } = {}) {
  return async (request, response, next) => {
    try {
      const company = await updateCompany(request.auth.user.id, request.validated.body);
      return response.json({ data: company });
    } catch (error) {
      return next(error);
    }
  };
}

export const getRecruiterCompanyHandler = createGetRecruiterCompanyHandler();
export const updateRecruiterCompanyHandler = createUpdateRecruiterCompanyHandler();
