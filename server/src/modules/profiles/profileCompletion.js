const SECTIONS = [
  {
    key: 'basicDetails',
    weight: 10,
    complete: (profile) => Boolean(profile.user?.name && profile.user?.email && profile.location),
  },
  { key: 'headline', weight: 10, complete: (profile) => Boolean(profile.headline) },
  { key: 'summary', weight: 10, complete: (profile) => Boolean(profile.summary) },
  { key: 'skills', weight: 15, complete: (profile) => profile.skills.length >= 3 },
  { key: 'education', weight: 10, complete: (profile) => profile.applicantEducations.length > 0 },
  { key: 'projects', weight: 10, complete: (profile) => profile.projects.length > 0 },
  { key: 'experience', weight: 10, complete: (profile) => profile.experiences.length > 0 },
  { key: 'certifications', weight: 5, complete: (profile) => profile.certifications.length > 0 },
  { key: 'resume', weight: 10, complete: (profile) => profile.resumes.length > 0 },
  {
    key: 'preferences',
    weight: 10,
    complete: (profile) =>
      profile.preferredLocations.length > 0 &&
      profile.preferredJobTypes.length > 0 &&
      profile.preferredWorkModes.length > 0,
  },
];

export function calculateProfileCompletion(profile) {
  const incomplete = SECTIONS.filter((section) => !section.complete(profile));
  const missingSections = incomplete.map((section) => section.key);
  const missingWeight = incomplete.reduce((total, section) => total + section.weight, 0);

  return {
    profileCompletion: 100 - missingWeight,
    missingSections,
  };
}
