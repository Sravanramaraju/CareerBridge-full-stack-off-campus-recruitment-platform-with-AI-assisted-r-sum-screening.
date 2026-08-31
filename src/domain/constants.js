export const EMPLOYMENT_TYPES = ['Full-time', 'Internship', 'Contract'];
export const WORK_MODES = ['On-site', 'Hybrid', 'Remote'];
export const EXPERIENCE_LEVELS = ['Fresher', '0–1 years', '1–2 years', '2–3 years'];

export const APPLICATION_STATUSES = {
  APPLIED: 'Applied',
  SCREENING: 'Screening',
  ASSESSMENT: 'Assessment',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Not selected',
  WITHDRAWN: 'Withdrawn',
};

export const JOB_STATUSES = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  CLOSED: 'Closed',
};

export const USER_ROLES = {
  APPLICANT: 'applicant',
  RECRUITER: 'recruiter',
  ADMIN: 'admin',
};

export const DEMO_ACCOUNTS = [
  { role: USER_ROLES.APPLICANT, email: 'applicant@careerbridge.demo', password: 'demo1234' },
  { role: USER_ROLES.RECRUITER, email: 'recruiter@careerbridge.demo', password: 'demo1234' },
  { role: USER_ROLES.ADMIN, email: 'admin@careerbridge.demo', password: 'demo1234' },
];
