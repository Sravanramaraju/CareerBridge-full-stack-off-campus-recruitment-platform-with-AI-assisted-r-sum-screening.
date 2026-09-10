import { AppError } from '../../lib/appError.js';
import { prisma } from '../../lib/database.js';
import { toRecruiterCandidate } from '../applications/recruiterApplication.presenter.js';
import { findCompanyMembershipForUser } from '../companies/company.repository.js';
import { getRecruiterDashboardData } from './recruiterDashboard.repository.js';

const APPLICATION_STATUSES = [
  'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED', 'WITHDRAWN',
];
const JOB_STATUSES = ['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'];

function countsByStatus(rows, statuses) {
  const counts = Object.fromEntries(statuses.map((status) => [status, 0]));
  rows.forEach((row) => { counts[row.status] = row._count._all; });
  return counts;
}

function membershipRequiredError() {
  return new AppError({
    code: 'COMPANY_MEMBERSHIP_REQUIRED',
    message: 'You do not have access to a recruiter company.',
    status: 403,
  });
}

function presentDashboardJob(job) {
  return {
    id: job.id,
    title: job.title,
    department: job.department,
    status: job.status,
    moderationStatus: job.moderationStatus,
    deadline: job.deadline,
    applicationCount: job._count.applications,
    updatedAt: job.updatedAt,
  };
}

export async function getRecruiterDashboard(
  recruiterId,
  {
    runTransaction = (operation) => prisma.$transaction(operation),
    findMembership = findCompanyMembershipForUser,
    loadDashboard = getRecruiterDashboardData,
    now = () => new Date(),
  } = {},
) {
  return runTransaction(async (database) => {
    const membership = await findMembership(recruiterId, database);
    if (!membership) throw membershipRequiredError();
    const generatedAt = now();
    const data = await loadDashboard(recruiterId, membership.company.id, generatedAt, database);
    const jobCounts = countsByStatus(data.jobCounts, JOB_STATUSES);
    const stages = countsByStatus(data.stageCounts, APPLICATION_STATUSES);

    return {
      company: {
        id: membership.company.id,
        name: membership.company.name,
        verificationStatus: membership.company.verificationStatus,
      },
      metrics: {
        activeJobs: jobCounts.PUBLISHED,
        draftJobs: jobCounts.DRAFT,
        newApplications: stages.APPLIED + stages.UNDER_REVIEW,
        shortlisted: stages.SHORTLISTED,
        interviews: stages.INTERVIEW,
      },
      stageDistribution: stages,
      recentCandidates: data.recentCandidates.map((application) => ({
        ...toRecruiterCandidate(application, generatedAt),
        job: application.job,
      })),
      activeJobs: data.activeJobs.map(presentDashboardJob),
      attention: {
        draftJobs: jobCounts.DRAFT,
        closingSoon: data.closingSoon,
        awaitingInitialReview: stages.APPLIED,
      },
      notifications: { unreadCount: data.unreadCount },
      generatedAt,
    };
  });
}
