import { getPublicCompanies } from './company.service.js';

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
