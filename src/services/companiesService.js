import { catalogService } from '@/src/services/mockApi';

export const companiesService = Object.freeze({
  getCompanies() {
    return catalogService.listCompanies();
  },
  getCompanyById(companyId) {
    return catalogService.getCompany(companyId);
  },
});
