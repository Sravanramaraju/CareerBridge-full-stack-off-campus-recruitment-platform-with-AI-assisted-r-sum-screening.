import { listPublicCompanies } from './company.repository.js';
import { toPublicCompany } from './company.presenter.js';

export async function getPublicCompanies(
  filters,
  { listCompanies = listPublicCompanies, now = () => new Date() } = {},
) {
  const { companies, total } = await listCompanies(filters, now());

  return {
    items: companies.map(toPublicCompany),
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages: Math.ceil(total / filters.pageSize),
    },
  };
}
