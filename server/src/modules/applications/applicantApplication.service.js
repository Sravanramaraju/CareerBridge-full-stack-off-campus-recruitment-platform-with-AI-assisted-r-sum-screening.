import { AppError, notFoundError } from '../../lib/appError.js';
import { prisma } from '../../lib/database.js';
import { createNotificationRecords } from '../notifications/notification.repository.js';
import { listCompanyRecruiterNotificationAccounts } from './applicationAudience.repository.js';
import { toApplicantApplication } from './application.presenter.js';
import {
  createApplicationStatusHistoryEvent,
  findOwnedApplicantApplication,
  listOwnedApplicantApplications,
  updateApplicantOwnedApplicationStatus,
} from './application.repository.js';
import { assertApplicationStatusTransition } from './applicationTransitions.js';

function concurrentStatusError() {
  return new AppError({
    code: 'APPLICATION_STATUS_CONFLICT',
    message: 'The application status changed. Refresh and retry.',
    status: 409,
  });
}

export async function getApplicantApplications(
  applicantId,
  { listApplications = listOwnedApplicantApplications } = {},
) {
  const applications = await listApplications(applicantId);
  return applications.map(toApplicantApplication);
}

export async function getApplicantApplication(
  applicantId,
  applicationId,
  { findApplication = findOwnedApplicantApplication } = {},
) {
  const application = await findApplication(applicationId, applicantId);
  if (!application) throw notFoundError('The requested application was not found.');
  return toApplicantApplication(application);
}

export async function withdrawApplicantApplication(
  applicantId,
  applicationId,
  {
    runTransaction = (operation) => prisma.$transaction(operation),
    findApplication = findOwnedApplicantApplication,
    assertTransition = assertApplicationStatusTransition,
    updateStatus = updateApplicantOwnedApplicationStatus,
    createHistory = createApplicationStatusHistoryEvent,
    listRecruiters = listCompanyRecruiterNotificationAccounts,
    createNotifications = createNotificationRecords,
  } = {},
) {
  return runTransaction(async (database) => {
    const current = await findApplication(applicationId, applicantId, database);
    if (!current) throw notFoundError('The requested application was not found.');
    if (!assertTransition(current.status, 'WITHDRAWN', 'APPLICANT')) {
      return toApplicantApplication(current);
    }

    const updated = await updateStatus(
      applicationId,
      applicantId,
      current.status,
      'WITHDRAWN',
      database,
    );
    if (updated.count !== 1) throw concurrentStatusError();

    await createHistory(
      applicationId,
      current.status,
      'WITHDRAWN',
      applicantId,
      'Application withdrawn by applicant.',
      database,
    );
    const memberships = await listRecruiters(current.job.company.id, database);
    await createNotifications(memberships.map(({ user }) => ({
      userId: user.id,
      type: 'APPLICATION_STATUS_CHANGED',
      title: 'Application withdrawn',
      message: `An applicant withdrew from ${current.job.title}.`,
      entityType: 'APPLICATION',
      entityId: applicationId,
    })), database);

    const application = await findApplication(applicationId, applicantId, database);
    return toApplicantApplication(application);
  });
}
