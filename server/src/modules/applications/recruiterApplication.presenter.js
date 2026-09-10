const STATUS_LABELS = {
  APPLIED: 'Applied',
  UNDER_REVIEW: 'Under Review',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview',
  OFFERED: 'Offered',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

export function calculateCandidateExperienceMonths(experiences, now = new Date()) {
  return experiences.reduce((total, experience) => {
    const start = experience.startDate ? new Date(experience.startDate) : null;
    const end = experience.isCurrent ? now : experience.endDate ? new Date(experience.endDate) : null;
    if (!start || !end || Number.isNaN(start.getTime()) || end <= start) return total;
    let months = (end.getUTCFullYear() - start.getUTCFullYear()) * 12
      + end.getUTCMonth() - start.getUTCMonth();
    const endTimeOfMonth = Date.UTC(
      start.getUTCFullYear(),
      start.getUTCMonth(),
      start.getUTCDate(),
      start.getUTCHours(),
      start.getUTCMinutes(),
      start.getUTCSeconds(),
      start.getUTCMilliseconds(),
    );
    const anniversary = new Date(endTimeOfMonth);
    anniversary.setUTCMonth(anniversary.getUTCMonth() + months);
    if (end < anniversary) months -= 1;
    return total + Math.max(0, months);
  }, 0);
}

function experienceLabel(months) {
  if (months === 0) return 'Fresher';
  if (months < 12) return `${months} month${months === 1 ? '' : 's'}`;
  const years = Number((months / 12).toFixed(1));
  return `${years} year${years === 1 ? '' : 's'}`;
}

export function toRecruiterCandidate(application, now = new Date()) {
  const profile = application.applicant.applicantProfile;
  const experienceMonths = calculateCandidateExperienceMonths(profile?.experiences ?? [], now);
  return {
    applicationId: application.id,
    jobId: application.jobId,
    resumeId: application.resumeId,
    applicantId: application.applicant.id,
    name: application.applicant.name,
    email: application.applicant.email,
    headline: profile?.headline || 'Applicant',
    location: profile?.location || 'Not provided',
    skills: (profile?.skills ?? []).map(({ skill }) => skill.name),
    experienceMonths,
    experience: experienceLabel(experienceMonths),
    match: application.match?.overallScore ?? null,
    matchDetails: application.match,
    statusCode: application.status,
    status: STATUS_LABELS[application.status] ?? application.status,
    appliedAt: application.appliedAt,
    updatedAt: application.updatedAt,
  };
}
