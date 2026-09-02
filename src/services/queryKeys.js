export const queryKeys = Object.freeze({
  jobs: (filters = {}) => ['jobs', filters],
  job: (jobId) => ['job', jobId],
  companies: () => ['companies'],
  company: (companyId) => ['company', companyId],
  companyJobs: (companyId) => ['company-jobs', companyId],
  applicantApplications: (applicantId = 'demo-applicant') => ['applications', applicantId],
  recruiterJobs: (recruiterId = 'demo-recruiter') => ['recruiter-jobs', recruiterId],
  jobApplicants: (jobId) => ['job-applicants', jobId],
  notifications: (role) => ['notifications', role],
});
