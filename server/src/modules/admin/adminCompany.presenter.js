const VERIFICATION_LABELS = {
  PENDING: 'Pending',
  VERIFIED: 'Verified',
  NEEDS_CHANGES: 'Needs changes',
  REJECTED: 'Rejected',
};

export function toAdminCompany(company) {
  return {
    id: company.id,
    name: company.name,
    slug: company.slug,
    website: company.website,
    industry: company.industry,
    companyType: company.companyType,
    size: company.size,
    headquarters: company.headquarters,
    verificationStatus: company.verificationStatus,
    verificationLabel: VERIFICATION_LABELS[company.verificationStatus],
    verifiedAt: company.verifiedAt,
    memberCount: company._count.members,
    jobCount: company._count.jobs,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
}
