const DEFAULT_BRAND_COLOR = '#2658d8';

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
