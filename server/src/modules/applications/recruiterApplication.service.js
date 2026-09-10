import { AppError, notFoundError } from '../../lib/appError.js';
import { findCompanyMembershipForUser } from '../companies/company.repository.js';
import { findOwnedRecruiterJob } from '../jobs/recruiterJob.repository.js';
import {
  findRecruiterApplicationDetail,
  listRecruiterJobApplicationCandidates,
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
