import { AppError } from '../../lib/appError.js';

const requiredTextFields = [
  ['title', 'Title'],
  ['location', 'Location'],
  ['summary', 'Summary'],
  ['description', 'Description'],
  ['qualification', 'Qualification'],
];

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function collectJobPublicationIssues(job, now = new Date()) {
  const issues = {};
  for (const [field, label] of requiredTextFields) {
    if (!hasText(job[field])) issues[field] = `${label} is required before publishing.`;
  }
  if (!job.workMode) issues.workMode = 'Work mode is required before publishing.';
  if (!job.employmentType) {
    issues.employmentType = 'Employment type is required before publishing.';
  }
  if (!Array.isArray(job.responsibilities) || job.responsibilities.length === 0) {
    issues.responsibilities = 'Add at least one responsibility before publishing.';
  }
  if (!job.deadline || Number.isNaN(new Date(job.deadline).getTime())) {
    issues.deadline = 'A valid application deadline is required before publishing.';
  } else if (new Date(job.deadline) <= now) {
    issues.deadline = 'The application deadline must be in the future.';
  }
  const requiredSkills = Array.isArray(job.skills)
    ? job.skills.filter((entry) => entry.requirement === 'REQUIRED' && entry.skill)
    : [];
  if (requiredSkills.length === 0) {
    issues.skills = 'Add at least one required skill before publishing.';
  }
  if (Array.isArray(job.screeningQuestions) && job.screeningQuestions.length > 5) {
    issues.screeningQuestions = 'A job may have no more than five screening questions.';
  }
  return issues;
}

export function assertJobReadyForPublication(job, now = new Date()) {
  const fields = collectJobPublicationIssues(job, now);
  if (Object.keys(fields).length > 0) {
    throw new AppError({
      code: 'JOB_NOT_READY',
      message: 'Complete the required job details before publishing.',
      status: 422,
      fields,
    });
  }
}
