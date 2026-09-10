import { AppError, notFoundError } from '../../lib/appError.js';
import { prisma } from '../../lib/database.js';
import { listCompanyRecruiterNotificationAccounts } from '../applications/applicationAudience.repository.js';
import { createNotificationRecords } from '../notifications/notification.repository.js';
import { createAuditLog } from './auditLog.repository.js';
import { toAdminJob } from './adminJob.presenter.js';
import {
  findAdminJob,
  listAdminJobs,
  updateJobModerationStatus,
} from './adminJob.repository.js';

const ACTION_STATUSES = { CLEAR: 'CLEARED', FLAG: 'FLAGGED', DEACTIVATE: 'DEACTIVATED' };
const MODERATION_LABELS = { CLEARED: 'Cleared', FLAGGED: 'Flagged', DEACTIVATED: 'Deactivated' };

function moderationConflictError() {
  return new AppError({
    code: 'ADMIN_MODERATION_CONFLICT',
    message: 'This moderation record changed. Refresh and retry.',
    status: 409,
  });
}

export async function getAdminJobs(filters, { listJobs = listAdminJobs } = {}) {
  const { jobs, total } = await listJobs(filters);
  return {
    items: jobs.map(toAdminJob),
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages: Math.ceil(total / filters.pageSize),
    },
  };
}

export async function moderateJob(
  adminId,
  jobId,
  input,
  auditContext = {},
  {
    runTransaction = (operation) => prisma.$transaction(operation),
    findJob = findAdminJob,
    updateModeration = updateJobModerationStatus,
    writeAudit = createAuditLog,
    listRecruiters = listCompanyRecruiterNotificationAccounts,
    createNotifications = createNotificationRecords,
  } = {},
) {
  return runTransaction(async (database) => {
    const current = await findJob(jobId, database);
    if (!current) throw notFoundError('The requested job was not found.');
    const nextStatus = ACTION_STATUSES[input.action];
    if (current.moderationStatus === nextStatus) return toAdminJob(current);

    const result = await updateModeration(
      jobId,
      current.moderationStatus,
      nextStatus,
      database,
    );
    if (result.count !== 1) throw moderationConflictError();

    await writeAudit({
      actorUserId: adminId,
      action: 'JOB_MODERATION_CHANGED',
      entityType: 'JOB',
      entityId: jobId,
      metadata: {
        from: current.moderationStatus,
        to: nextStatus,
        reason: input.reason || null,
      },
      ...auditContext,
    }, database);

    const memberships = await listRecruiters(current.company.id, database);
    await createNotifications(memberships.map(({ user }) => ({
      userId: user.id,
      type: 'JOB_MODERATION_CHANGED',
      title: 'Job moderation updated',
      message: `${current.title} is now ${MODERATION_LABELS[nextStatus]}.`,
      entityType: 'JOB',
      entityId: jobId,
    })), database);

    return toAdminJob(await findJob(jobId, database));
  });
}
