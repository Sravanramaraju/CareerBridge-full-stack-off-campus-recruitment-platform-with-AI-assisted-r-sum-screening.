export const queryKeys = Object.freeze({
  jobs: (filters = {}) => ['jobs', filters],
  job: (jobId) => ['job', jobId],
  companies: (filters = {}) => ['companies', filters],
  company: (companyId) => ['company', companyId],
  companyJobs: (companyId, filters = {}) => ['company-jobs', companyId, filters],
  jobMatch: (jobId) => ['job-match', jobId],
  applicantApplications: (applicantId = 'demo-applicant') => ['applications', applicantId],
  recruiterJobs: (recruiterId = 'demo-recruiter') => ['recruiter-jobs', recruiterId],
  jobApplicants: (jobId) => ['job-applicants', jobId],
  notifications: (role) => ['notifications', role],
});
