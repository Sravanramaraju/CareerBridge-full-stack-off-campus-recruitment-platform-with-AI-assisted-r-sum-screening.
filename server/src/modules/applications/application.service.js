import { AppError, notFoundError } from '../../lib/appError.js';
import { prisma } from '../../lib/database.js';
import { queueEmail } from '../email/emailOutbox.service.js';
import { findPublicJobByIdentifier } from '../jobs/job.repository.js';
import { createApplicationMatch } from '../matching/applicationMatch.repository.js';
import { calculateHybridMatch } from '../matching/hybridMatch.service.js';
import { createNotificationRecords } from '../notifications/notification.repository.js';
import { findApplicantProfileByUserId } from '../profiles/profile.repository.js';
import { findOwnedResume } from '../resumes/resume.repository.js';
import {
  findApplicantNotificationAccount,
  listCompanyRecruiterNotificationAccounts,
} from './applicationAudience.repository.js';
import {
  createApplicantApplication,
  findApplicantApplicationByJob,
} from './application.repository.js';

function duplicateApplicationError() {
  return new AppError({
    code: 'APPLICATION_EXISTS',
    message: 'You have already applied to this job.',
    status: 409,
  });
}

function screeningAnswersForJob(job, submittedAnswers) {
  const questions = new Map(job.screeningQuestions.map((question) => [question.id, question]));
  const answers = new Map(submittedAnswers.map((answer) => [answer.questionId, answer.answer]));
  const fields = {};
  for (const answer of submittedAnswers) {
    if (!questions.has(answer.questionId)) {
      fields[`screeningAnswers.${answer.questionId}`] = 'This question does not belong to the job.';
    }
  }
  for (const question of job.screeningQuestions) {
    if (question.required && !answers.has(question.id)) {
      fields[`screeningAnswers.${question.id}`] = 'This screening question is required.';
    }
  }
  if (Object.keys(fields).length > 0) {
    throw new AppError({
      code: 'INVALID_SCREENING_ANSWERS',
      message: 'Review the screening answers and try again.',
      status: 422,
      fields,
    });
  }
  return submittedAnswers.map((answer) => ({
    ...answer,
    questionSnapshot: questions.get(answer.questionId).question,
  }));
}

async function createApplicationNotifications(
  application,
  job,
  profile,
  database,
  dependencies,
) {
  const [applicantAccount, recruiterMemberships] = await Promise.all([
    dependencies.findApplicantAccount(application.applicantId, database),
    dependencies.listRecruiterAccounts(job.companyId, database),
  ]);
  const recruiterAccounts = recruiterMemberships.map(({ user }) => user);
  await dependencies.createNotifications([
    {
      userId: application.applicantId,
      type: 'APPLICATION_SUBMITTED',
      title: 'Application submitted',
      message: `Your application for ${job.title} at ${job.company.name} was submitted.`,
      entityType: 'APPLICATION',
      entityId: application.id,
    },
    ...recruiterAccounts.map((account) => ({
      userId: account.id,
      type: 'APPLICATION_RECEIVED',
      title: 'New application received',
      message: `${profile.user.name} applied for ${job.title}.`,
      entityType: 'APPLICATION',
      entityId: application.id,
    })),
  ], database);

  if (applicantAccount && applicantAccount.preference?.applicationUpdates !== false) {
    await dependencies.queueMessage({
      recipient: applicantAccount.email,
      subject: `Application submitted: ${job.title}`,
      template: 'application-submitted',
      payload: {
        name: applicantAccount.name,
        jobTitle: job.title,
        companyName: job.company.name,
        applicationId: application.id,
      },
    }, database);
  }
  await Promise.all(recruiterAccounts
    .filter((account) => account.preference?.newApplications !== false)
    .map((account) => dependencies.queueMessage({
      recipient: account.email,
      subject: `New application: ${job.title}`,
      template: 'application-received',
      payload: {
        name: account.name,
        applicantName: profile.user.name,
        jobTitle: job.title,
        applicationId: application.id,
      },
    }, database)));
}

export async function submitJobApplication(
  applicantId,
  jobIdentifier,
  input,
  {
    runTransaction = (operation) => prisma.$transaction(operation),
    findJob = findPublicJobByIdentifier,
    findResume = findOwnedResume,
    findDuplicate = findApplicantApplicationByJob,
    findProfile = findApplicantProfileByUserId,
    createApplication = createApplicantApplication,
    calculateMatch = calculateHybridMatch,
    createMatch = createApplicationMatch,
    findApplicantAccount = findApplicantNotificationAccount,
    listRecruiterAccounts = listCompanyRecruiterNotificationAccounts,
    createNotifications = createNotificationRecords,
    queueMessage = queueEmail,
    now = () => new Date(),
  } = {},
) {
  return runTransaction(async (database) => {
    const submittedAt = now();
    const job = await findJob(jobIdentifier, submittedAt, database);
    if (!job) throw notFoundError('The requested job is not available for applications.');

    const [resume, existing, profile] = await Promise.all([
      findResume(input.resumeId, applicantId, database),
      findDuplicate(applicantId, job.id, database),
      findProfile(applicantId, database),
    ]);
    if (!resume) throw notFoundError('The selected resume is not available.');
    if (existing) throw duplicateApplicationError();
    if (!profile) throw notFoundError('Complete your applicant profile before applying.');

    const screeningAnswers = screeningAnswersForJob(job, input.screeningAnswers);
    const application = await createApplication(applicantId, job.id, {
      ...input,
      screeningAnswers,
    }, database);
    const match = calculateMatch(job, profile, { now: submittedAt });
    await createMatch(application.id, match, database);
    await createApplicationNotifications(application, job, profile, database, {
      findApplicantAccount,
      listRecruiterAccounts,
      createNotifications,
      queueMessage,
    });
    return application;
  });
}
