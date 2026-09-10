import { notFoundError } from '../../lib/appError.js';
import { toApplicantApplication } from './application.presenter.js';
import {
  findOwnedApplicantApplication,
  listOwnedApplicantApplications,
} from './application.repository.js';

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
