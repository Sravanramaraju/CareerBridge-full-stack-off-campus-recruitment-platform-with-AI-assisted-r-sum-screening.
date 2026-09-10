import { normalizeSkillName } from '../profiles/skillNormalization.js';
import { SKILL_WEIGHTS } from './matching.constants.js';

function boundedScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function ratioScore(matched, total) {
  return total === 0 ? 100 : boundedScore((matched / total) * 100);
}

function canonicalPreference(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[-\s]+/g, '_');
}

function skillCompatibility(job, profile) {
  const applicantSkills = new Set(
    (profile.skills ?? []).map(({ skill }) => normalizeSkillName(skill.normalizedName || skill.name)),
  );
  const required = (job.skills ?? []).filter(({ requirement }) => requirement === 'REQUIRED');
  const preferred = (job.skills ?? []).filter(({ requirement }) => requirement === 'PREFERRED');
  const requiredMatched = required.filter(({ skill }) => applicantSkills.has(
    normalizeSkillName(skill.normalizedName || skill.name),
  ));
  const preferredMatched = preferred.filter(({ skill }) => applicantSkills.has(
    normalizeSkillName(skill.normalizedName || skill.name),
  ));
  const requiredSkillScore = ratioScore(requiredMatched.length, required.length);
  const preferredSkillScore = ratioScore(preferredMatched.length, preferred.length);

  return {
    requiredSkillScore,
    preferredSkillScore,
    score: boundedScore(
      (requiredSkillScore * SKILL_WEIGHTS.required
        + preferredSkillScore * SKILL_WEIGHTS.preferred) / 100,
    ),
    requiredSkillsMatched: requiredMatched.map(({ skill }) => skill.name),
    requiredSkillsMissing: required
      .filter((entry) => !requiredMatched.includes(entry))
      .map(({ skill }) => skill.name),
    preferredSkillsMatched: preferredMatched.map(({ skill }) => skill.name),
  };
}

function experienceYears(experiences, now) {
  const totalMilliseconds = experiences.reduce((total, experience) => {
    const start = experience.startDate ? new Date(experience.startDate) : null;
    const end = experience.isCurrent ? now : experience.endDate ? new Date(experience.endDate) : null;
    if (!start || !end || Number.isNaN(start.getTime()) || end <= start) return total;
    return total + (end - start);
  }, 0);
  return totalMilliseconds / (365.25 * 24 * 60 * 60 * 1_000);
}

function experienceCompatibility(job, profile, now) {
  if (job.experienceMin <= 0) return 100;
  const years = experienceYears(profile.experiences ?? [], now);
  return boundedScore((years / job.experienceMin) * 100);
}

function preferenceCompatibility(job, profile) {
  const signals = [];
  if ((profile.preferredWorkModes ?? []).length > 0) {
    const preferredModes = new Set(profile.preferredWorkModes.map(canonicalPreference));
    signals.push(preferredModes.has(canonicalPreference(job.workMode)) ? 100 : 0);
  }
  if ((profile.preferredLocations ?? []).length > 0) {
    const location = String(job.location ?? '').toLocaleLowerCase();
    const locationMatch = profile.preferredLocations.some((preference) => {
      const normalized = preference.trim().toLocaleLowerCase();
      return location.includes(normalized)
        || normalized.includes(location)
        || (canonicalPreference(job.workMode) === 'REMOTE' && normalized === 'remote');
    });
    signals.push(locationMatch ? 100 : 0);
  }
  return signals.length === 0
    ? 50
    : boundedScore(signals.reduce((total, score) => total + score, 0) / signals.length);
}

export function calculateStructuredMatch(job, profile, now = new Date()) {
  const skills = skillCompatibility(job, profile);
  const experienceScore = experienceCompatibility(job, profile, now);
  const educationScore = (profile.applicantEducations ?? []).length > 0 ? 100 : 0;
  const preferenceScore = preferenceCompatibility(job, profile);
  const explanation = [];

  if (skills.requiredSkillsMatched.length > 0) {
    explanation.push(`${skills.requiredSkillsMatched.length} required skill(s) matched.`);
  }
  if (skills.requiredSkillsMissing.length > 0) {
    explanation.push(`Missing required skills: ${skills.requiredSkillsMissing.join(', ')}.`);
  }
  explanation.push(experienceScore === 100
    ? 'The minimum experience requirement is satisfied.'
    : 'The recorded experience is below the requested minimum.');
  explanation.push(educationScore === 100
    ? 'Education evidence is present on the profile.'
    : 'No education evidence is present on the profile.');

  return {
    skillScore: skills.score,
    requiredSkillScore: skills.requiredSkillScore,
    preferredSkillScore: skills.preferredSkillScore,
    experienceScore,
    educationScore,
    preferenceScore,
    requiredSkillsMatched: skills.requiredSkillsMatched,
    requiredSkillsMissing: skills.requiredSkillsMissing,
    preferredSkillsMatched: skills.preferredSkillsMatched,
    explanation,
  };
}
