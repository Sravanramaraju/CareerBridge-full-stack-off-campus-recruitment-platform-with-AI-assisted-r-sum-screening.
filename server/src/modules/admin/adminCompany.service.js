import { toAdminCompany } from './adminCompany.presenter.js';
import { listAdminCompanies } from './adminCompany.repository.js';

export async function getAdminCompanies(
  filters,
  { listCompanies = listAdminCompanies } = {},
) {
  const { companies, total } = await listCompanies(filters);
  return {
    items: companies.map(toAdminCompany),
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages: Math.ceil(total / filters.pageSize),
    },
  };
}
