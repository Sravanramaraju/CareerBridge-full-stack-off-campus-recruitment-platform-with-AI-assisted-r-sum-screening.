const WORK_MODE_LABELS = {
  ON_SITE: 'On-site',
  HYBRID: 'Hybrid',
  REMOTE: 'Remote',
};

const EMPLOYMENT_TYPE_LABELS = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
};

function decimalValue(value) {
  if (value === null || value === undefined) return null;
  return Number(value.toString());
}

function lpa(value) {
  return Number((value / 100_000).toFixed(1)).toString();
}

function salaryLabel(job) {
  if (job.hideSalary) return 'Not disclosed';
  const minimum = decimalValue(job.salaryMin);
  const maximum = decimalValue(job.salaryMax);
  if (job.currency !== 'INR' || (!minimum && !maximum)) return 'Not disclosed';
  if (minimum && maximum) return `₹${lpa(minimum)}–${lpa(maximum)} LPA`;
  if (minimum) return `₹${lpa(minimum)}+ LPA`;
  return `Up to ₹${lpa(maximum)} LPA`;
}

function experienceLabel(minimum, maximum) {
  if (minimum === 0 && maximum === 0) return 'Fresher';
  return `${minimum}–${maximum} years`;
}

function companyInitials(company) {
  return (
    company.brandInitials ||
    company.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('')
  );
}

export function toPublicJob(job) {
  const requiredSkills = job.skills
    .filter(({ requirement }) => requirement === 'REQUIRED')
    .map(({ skill }) => skill.name);
  const preferredSkills = job.skills
    .filter(({ requirement }) => requirement === 'PREFERRED')
    .map(({ skill }) => skill.name);

  return {
    ...job,
    salaryMin: job.hideSalary ? null : job.salaryMin,
    salaryMax: job.hideSalary ? null : job.salaryMax,
    workMode: WORK_MODE_LABELS[job.workMode],
    employmentType: EMPLOYMENT_TYPE_LABELS[job.employmentType],
    experience: experienceLabel(job.experienceMin, job.experienceMax),
    salary: salaryLabel(job),
    skills: [...requiredSkills, ...preferredSkills],
    requiredSkills,
    preferredSkills,
    postedAt: job.publishedAt,
    status: 'Published',
    company: {
      ...job.company,
      initials: companyInitials(job.company),
      accent: job.company.brandColor || '#2658d8',
      verified: job.company.verificationStatus === 'VERIFIED',
    },
  };
}
