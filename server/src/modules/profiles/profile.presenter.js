import { calculateProfileCompletion } from './profileCompletion.js';

function educationPeriod(education) {
  if (!education.startYear && !education.endYear) return '';
  return `${education.startYear || ''}–${education.isCurrent ? 'Present' : education.endYear || ''}`;
}

function certificationLabel(certification) {
  return [certification.name, certification.issuer].filter(Boolean).join(' · ');
}

export function toApplicantSkillRecords(records) {
  return records.map(({ skill, proficiency, yearsExperience }) => ({
    id: skill.id,
    name: skill.name,
    normalizedName: skill.normalizedName,
    proficiency,
    yearsExperience: yearsExperience === null ? null : Number(yearsExperience),
  }));
}

export function toApplicantProfile(profile) {
  const completion = calculateProfileCompletion(profile);
  const primaryResume = profile.resumes.find((resume) => resume.isPrimary) || profile.resumes[0];
  const skillRecords = toApplicantSkillRecords(profile.skills);

  return {
    id: profile.id,
    name: profile.user.name,
    email: profile.user.email,
    headline: profile.headline,
    phone: profile.phone,
    location: profile.location,
    summary: profile.summary,
    skills: skillRecords.map(({ name }) => name),
    skillRecords,
    education: profile.applicantEducations.map((education) => ({
      ...education,
      period: educationPeriod(education),
    })),
    experience: profile.experiences,
    projects: profile.projects,
    certifications: profile.certifications.map(certificationLabel),
    certificationRecords: profile.certifications,
    preferences: {
      locations: profile.preferredLocations,
      jobTypes: profile.preferredJobTypes,
      workModes: profile.preferredWorkModes,
    },
    resumes: profile.resumes,
    resumeName: primaryResume?.originalFileName || '',
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    ...completion,
  };
}
