const DEFAULT_BRAND_COLOR = '#2658d8';
const VERIFICATION_LABELS = {
  PENDING: 'Pending',
  VERIFIED: 'Verified',
  NEEDS_CHANGES: 'Needs changes',
  REJECTED: 'Rejected',
};

function deriveInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

export function toPublicCompany(company) {
  const { _count, ...fields } = company;

  return {
    ...fields,
    initials: company.brandInitials || deriveInitials(company.name),
    accent: company.brandColor || DEFAULT_BRAND_COLOR,
    location: company.headquarters || company.locations[0] || '',
    founded: company.foundedYear,
    verified: company.verificationStatus === 'VERIFIED',
    openRoles: _count?.jobs ?? 0,
  };
}

export function toRecruiterCompany(membership) {
  const company = membership.company;

  return {
    ...company,
    about: company.description,
    initials: company.brandInitials || deriveInitials(company.name),
    accent: company.brandColor || DEFAULT_BRAND_COLOR,
    verificationCode: company.verificationStatus,
    verificationStatus: VERIFICATION_LABELS[company.verificationStatus],
    membershipRole: membership.role,
  };
}
