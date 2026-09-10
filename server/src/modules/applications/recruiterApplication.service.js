import { AppError, notFoundError } from '../../lib/appError.js';
import { prisma } from '../../lib/database.js';
import { findCompanyMembershipForUser } from '../companies/company.repository.js';
import { queueEmail } from '../email/emailOutbox.service.js';
import { findOwnedRecruiterJob } from '../jobs/recruiterJob.repository.js';
import { createNotificationRecords } from '../notifications/notification.repository.js';
import { findApplicantNotificationAccount } from './applicationAudience.repository.js';
import { assertApplicationStatusTransition } from './applicationTransitions.js';
import {
  createApplicationStatusHistoryEvent,
  findRecruiterApplicationDetail,
  listRecruiterJobApplicationCandidates,
  updateRecruiterOwnedApplicationStatus,
} from './recruiterApplication.repository.js';
import { toRecruiterApplicationDetail } from './recruiterApplicationDetail.presenter.js';
import { toRecruiterCandidate } from './recruiterApplication.presenter.js';

function membershipRequiredError() {
  return new AppError({
    code: 'COMPANY_MEMBERSHIP_REQUIRED',
    message: 'You do not have access to a recruiter company.',
    status: 403,
  });
}

const STATUS_LABELS = {
  UNDER_REVIEW: 'Under Review',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview',
  OFFERED: 'Offered',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

function concurrentStatusError() {
  return new AppError({
    code: 'APPLICATION_STATUS_CONFLICT',
    message: 'The application status changed. Refresh and retry.',
    status: 409,
  });
}

export async function getRecruiterJobApplications(
  recruiterId,
  jobId,
  filters,
  {
    findMembership = findCompanyMembershipForUser,
    findJob = findOwnedRecruiterJob,
    listCandidates = listRecruiterJobApplicationCandidates,
    now = () => new Date(),
  } = {},
) {
  const membership = await findMembership(recruiterId);
  if (!membership) throw membershipRequiredError();
  const job = await findJob(jobId, membership.company.id);
  if (!job) throw notFoundError('The requested job was not found.');

  const calculatedAt = now();
  const presented = (await listCandidates(jobId, filters))
    .map((application) => toRecruiterCandidate(application, calculatedAt));
  const filtered = filters.minExperienceMonths === undefined
    ? presented
    : presented.filter((candidate) => candidate.experienceMonths >= filters.minExperienceMonths);
  const start = (filters.page - 1) * filters.pageSize;
  return {
    job,
    items: filtered.slice(start, start + filters.pageSize),
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / filters.pageSize),
    },
  };
}

export async function getRecruiterApplication(
  recruiterId,
  applicationId,
  {
    findMembership = findCompanyMembershipForUser,
    findApplication = findRecruiterApplicationDetail,
    now = () => new Date(),
  } = {},
) {
  const membership = await findMembership(recruiterId);
  if (!membership) throw membershipRequiredError();
  const application = await findApplication(applicationId, membership.company.id);
  if (!application) throw notFoundError('The requested application was not found.');
  return toRecruiterApplicationDetail(application, now());
}

export async function updateRecruiterApplicationStatus(
  recruiterId,
  applicationId,
  input,
  {
    runTransaction = (operation) => prisma.$transaction(operation),
    findMembership = findCompanyMembershipForUser,
    findApplication = findRecruiterApplicationDetail,
    assertTransition = assertApplicationStatusTransition,
    updateStatus = updateRecruiterOwnedApplicationStatus,
    createHistory = createApplicationStatusHistoryEvent,
    findApplicantAccount = findApplicantNotificationAccount,
    createNotifications = createNotificationRecords,
    queueMessage = queueEmail,
    now = () => new Date(),
  } = {},
) {
  return runTransaction(async (database) => {
    const membership = await findMembership(recruiterId, database);
    if (!membership) throw membershipRequiredError();
    const current = await findApplication(applicationId, membership.company.id, database);
    if (!current) throw notFoundError('The requested application was not found.');
    if (!assertTransition(current.status, input.status, 'RECRUITER')) {
      return toRecruiterApplicationDetail(current, now());
    }

    const reason = input.reason || `Application moved to ${STATUS_LABELS[input.status]}.`;
    const updated = await updateStatus(
      applicationId,
      membership.company.id,
      current.status,
      input.status,
      database,
    );
    if (updated.count !== 1) throw concurrentStatusError();
    await createHistory(
      applicationId,
      current.status,
      input.status,
      recruiterId,
      reason,
      database,
    );
    await createNotifications([{
      userId: current.applicant.id,
      type: 'APPLICATION_STATUS_CHANGED',
      title: 'Application status updated',
      message: `Your application for ${current.job.title} is now ${STATUS_LABELS[input.status]}.`,
      entityType: 'APPLICATION',
      entityId: applicationId,
    }], database);

    const applicantAccount = await findApplicantAccount(current.applicant.id, database);
    if (applicantAccount && applicantAccount.preference?.applicationUpdates !== false) {
      await queueMessage({
        recipient: applicantAccount.email,
        subject: `Application update: ${current.job.title}`,
        template: 'application-status-changed',
        payload: {
          name: applicantAccount.name,
          jobTitle: current.job.title,
          status: STATUS_LABELS[input.status],
          reason,
          applicationId,
        },
      }, database);
    }
    const application = await findApplication(applicationId, membership.company.id, database);
    return toRecruiterApplicationDetail(application, now());
  });
}
