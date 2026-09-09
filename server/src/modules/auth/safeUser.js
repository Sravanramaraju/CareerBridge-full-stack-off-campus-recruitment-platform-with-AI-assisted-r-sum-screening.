export function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    ...(user.lastLoginAt ? { lastLoginAt: user.lastLoginAt } : {}),
    context: {
      applicantProfileId: user.applicantProfile?.id ?? null,
      recruiterProfileId: user.recruiterProfile?.id ?? null,
      companies: (user.companyMemberships ?? []).map((membership) => ({
        id: membership.companyId,
        name: membership.company.name,
        slug: membership.company.slug,
        verificationStatus: membership.company.verificationStatus,
        membershipRole: membership.role,
      })),
    },
  };
}
