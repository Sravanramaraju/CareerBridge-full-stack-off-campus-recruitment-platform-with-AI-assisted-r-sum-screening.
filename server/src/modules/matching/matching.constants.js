export const MATCHING_WEIGHTS = Object.freeze({
  skills: 45,
  experience: 15,
  education: 10,
  preference: 10,
  semantic: 20,
});

export const SKILL_WEIGHTS = Object.freeze({
  required: 80,
  preferred: 20,
});

export const MATCH_MODEL_VERSION = 'careerbridge-hybrid-v1';

export const MATCH_LABELS = Object.freeze([
  { minimum: 80, label: 'Strong match' },
  { minimum: 60, label: 'Good match' },
  { minimum: 40, label: 'Partial match' },
  { minimum: 0, label: 'Limited match' },
]);
