import { notFoundError } from '../../lib/appError.js';
import {
  findPublicCompanyByIdentifier,
  listPublicCompanies,
} from './company.repository.js';
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

export async function getPublicCompany(
  identifier,
  { findCompany = findPublicCompanyByIdentifier, now = () => new Date() } = {},
) {
  const company = await findCompany(identifier, now());
  if (!company) throw notFoundError('The requested company was not found.');
  return toPublicCompany(company);
}
