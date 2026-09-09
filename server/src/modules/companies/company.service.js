import { AppError, notFoundError } from '../../lib/appError.js';
import {
  findCompanyMembershipForUser,
  findPublicCompanyByIdentifier,
  listPublicCompanies,
} from './company.repository.js';
import { toPublicCompany, toRecruiterCompany } from './company.presenter.js';

function membershipRequiredError() {
  return new AppError({
    code: 'COMPANY_MEMBERSHIP_REQUIRED',
    message: 'You do not have access to a recruiter company.',
    status: 403,
  });
}

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

export async function getRecruiterCompany(
  userId,
  { findMembership = findCompanyMembershipForUser } = {},
) {
  const membership = await findMembership(userId);
  if (!membership) throw membershipRequiredError();
  return toRecruiterCompany(membership);
}
