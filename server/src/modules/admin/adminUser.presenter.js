const ROLE_LABELS = { APPLICANT: 'Applicant', RECRUITER: 'Recruiter', ADMIN: 'Admin' };
const STATUS_LABELS = {
  ACTIVE: 'Active', SUSPENDED: 'Suspended', DEACTIVATED: 'Deactivated',
};

export function toAdminUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    roleLabel: ROLE_LABELS[user.role],
    status: user.status,
    statusLabel: STATUS_LABELS[user.status],
    activeSessionCount: user._count.sessions,
    applicationCount: user._count.applications,
    companyMembershipCount: user._count.companyMemberships,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
