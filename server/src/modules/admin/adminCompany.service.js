import { AppError, notFoundError } from '../../lib/appError.js';
import { prisma } from '../../lib/database.js';
import { listCompanyRecruiterNotificationAccounts } from '../applications/applicationAudience.repository.js';
import { queueEmail } from '../email/emailOutbox.service.js';
import { createNotificationRecords } from '../notifications/notification.repository.js';
import { createAuditLog } from './auditLog.repository.js';
import { toAdminCompany } from './adminCompany.presenter.js';
import {
  findAdminCompany,
  listAdminCompanies,
  updateCompanyVerificationStatus,
} from './adminCompany.repository.js';

const VERIFICATION_LABELS = {
  VERIFIED: 'Verified',
  NEEDS_CHANGES: 'Needs changes',
  REJECTED: 'Rejected',
};

function moderationConflictError() {
  return new AppError({
    code: 'ADMIN_MODERATION_CONFLICT',
    message: 'This moderation record changed. Refresh and retry.',
    status: 409,
  });
}

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

export async function moderateCompanyVerification(
  adminId,
  companyId,
  input,
  auditContext = {},
  {
    runTransaction = (operation) => prisma.$transaction(operation),
    findCompany = findAdminCompany,
    updateVerification = updateCompanyVerificationStatus,
    writeAudit = createAuditLog,
    listRecruiters = listCompanyRecruiterNotificationAccounts,
    createNotifications = createNotificationRecords,
    queueMessage = queueEmail,
    now = () => new Date(),
  } = {},
) {
  return runTransaction(async (database) => {
    const current = await findCompany(companyId, database);
    if (!current) throw notFoundError('The requested company was not found.');
    if (current.verificationStatus === input.status) return toAdminCompany(current);

    const changedAt = now();
    const result = await updateVerification(
      companyId,
      current.verificationStatus,
      input.status,
      input.status === 'VERIFIED' ? changedAt : null,
      database,
    );
    if (result.count !== 1) throw moderationConflictError();

    await writeAudit({
      actorUserId: adminId,
      action: 'COMPANY_VERIFICATION_CHANGED',
      entityType: 'COMPANY',
      entityId: companyId,
      metadata: {
        from: current.verificationStatus,
        to: input.status,
        reason: input.reason || null,
      },
      ...auditContext,
    }, database);

    const memberships = await listRecruiters(companyId, database);
    const statusLabel = VERIFICATION_LABELS[input.status];
    await createNotifications(memberships.map(({ user }) => ({
      userId: user.id,
      type: 'COMPANY_VERIFICATION_CHANGED',
      title: 'Company verification updated',
      message: `${current.name} is now ${statusLabel}.`,
      entityType: 'COMPANY',
      entityId: companyId,
    })), database);
    await Promise.all(memberships.map(({ user }) => queueMessage({
      recipient: user.email,
      subject: `Company verification: ${current.name}`,
      template: 'company-verification-changed',
      payload: {
        name: user.name,
        companyName: current.name,
        status: statusLabel,
        reason: input.reason || null,
      },
    }, database)));

    return toAdminCompany(await findCompany(companyId, database));
  });
}
