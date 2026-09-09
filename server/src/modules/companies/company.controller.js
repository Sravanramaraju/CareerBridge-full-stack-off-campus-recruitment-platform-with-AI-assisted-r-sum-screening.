import { getPublicCompanies, getPublicCompany } from './company.service.js';

export function createListCompaniesHandler({ getCompanies = getPublicCompanies } = {}) {
  return async (request, response, next) => {
    try {
      const result = await getCompanies(request.validated.query);
      return response.json({ data: result });
    } catch (error) {
      return next(error);
    }
  };
}

export const listCompaniesHandler = createListCompaniesHandler();

export function createGetCompanyHandler({ getCompany = getPublicCompany } = {}) {
  return async (request, response, next) => {
    try {
      const company = await getCompany(request.validated.params.companyId);
      return response.json({ data: company });
    } catch (error) {
      return next(error);
    }
  };
}

export const getCompanyHandler = createGetCompanyHandler();
