import { AppError } from '../../lib/appError.js';
import { toSlug } from '../../lib/slug.js';
import { createOpaqueToken } from '../../lib/tokens.js';
import { findCompanyIdBySlug } from './auth.repository.js';

const MAX_SLUG_ATTEMPTS = 5;

export async function createAvailableCompanySlug(
  companyName,
  database,
  { findCompany = findCompanyIdBySlug, suffixFactory = createOpaqueToken } = {},
) {
  const baseSlug = toSlug(companyName) || 'company';

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
    const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${suffixFactory().slice(0, 6)}`;
    if (!(await findCompany(candidate, database))) return candidate;
  }

  throw new AppError({
    code: 'COMPANY_SLUG_CONFLICT',
    message: 'A public company address could not be created. Please try again.',
    status: 409,
  });
}
