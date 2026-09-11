import { apiClient } from '@/src/services/apiClient';
import { buildQueryString } from '@/src/services/queryString';

export const companiesService = Object.freeze({
  getCompanies(filters = {}, options) {
    return apiClient.get(`/companies${buildQueryString(filters)}`, options);
  },
  getCompanyById(companyId, options) {
    return apiClient.get(`/companies/${encodeURIComponent(companyId)}`, options);
  },
});
