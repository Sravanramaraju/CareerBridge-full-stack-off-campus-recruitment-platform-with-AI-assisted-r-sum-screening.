function normaliseSkills(skills = []) {
  return new Set(skills.map((skill) => skill.trim().toLocaleLowerCase()));
}

export const matchService = Object.freeze({
  scoreJob(job, profile) {
    const profileSkills = normaliseSkills(profile.skills);
    const matchedSkills = job.skills.filter((skill) => profileSkills.has(skill.toLocaleLowerCase()));
    const missingSkills = job.skills.filter((skill) => !profileSkills.has(skill.toLocaleLowerCase()));
    const requiredSkills = Math.round((matchedSkills.length / Math.max(job.skills.length, 1)) * 100);
    const locationMatch = profile.preferences?.workModes?.includes(job.workMode)
      || profile.preferences?.locations?.some((location) => job.location.includes(location) || location === 'Remote');
    const overall = Math.round(requiredSkills * 0.55 + 20 + (locationMatch ? 15 : 7));

    return {
      overall: Math.min(98, overall),
      requiredSkills,
      preferredSkills: Math.min(100, requiredSkills + 8),
      experience: 'Matched',
      education: 'Matched',
      location: locationMatch ? 'Matched' : 'Review',
      semanticSimilarity: Math.min(94, requiredSkills + 12),
      matchedSkills,
      missingSkills,
    };
  },
});
