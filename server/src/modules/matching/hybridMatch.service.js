import {
  MATCHING_WEIGHTS,
  MATCH_LABELS,
  MATCH_MODEL_VERSION,
} from './matching.constants.js';
import { calculateStructuredMatch } from './structuredMatch.service.js';

function boundedScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function matchLabel(score) {
  return MATCH_LABELS.find(({ minimum }) => score >= minimum)?.label ?? 'Limited match';
}

export function calculateHybridMatch(
  job,
  profile,
  { semanticScore = null, now = new Date() } = {},
) {
  const structured = calculateStructuredMatch(job, profile, now);
  const semanticAvailable = Number.isFinite(semanticScore);
  const structuredWeighted = (
    structured.skillScore * MATCHING_WEIGHTS.skills
    + structured.experienceScore * MATCHING_WEIGHTS.experience
    + structured.educationScore * MATCHING_WEIGHTS.education
    + structured.preferenceScore * MATCHING_WEIGHTS.preference
  );
  const availableWeight = semanticAvailable
    ? 100
    : 100 - MATCHING_WEIGHTS.semantic;
  const weightedTotal = semanticAvailable
    ? structuredWeighted + boundedScore(semanticScore) * MATCHING_WEIGHTS.semantic
    : structuredWeighted;
  const overallScore = boundedScore(weightedTotal / availableWeight);
  const normalizedSemanticScore = semanticAvailable ? boundedScore(semanticScore) : null;
  const breakdown = {
    skills: structured.skillScore,
    experience: structured.experienceScore,
    education: structured.educationScore,
    location: structured.preferenceScore,
    similarity: normalizedSemanticScore,
  };

  return {
    overallScore,
    requiredSkillScore: structured.requiredSkillScore,
    preferredSkillScore: structured.preferredSkillScore,
    experienceScore: structured.experienceScore,
    preferenceScore: structured.preferenceScore,
    semanticScore: normalizedSemanticScore,
    semanticAvailable,
    requiredSkillsMatched: structured.requiredSkillsMatched,
    requiredSkillsMissing: structured.requiredSkillsMissing,
    preferredSkillsMatched: structured.preferredSkillsMatched,
    explanation: {
      label: matchLabel(overallScore),
      breakdown,
      reasons: structured.explanation,
      semanticAvailable,
    },
    modelVersion: MATCH_MODEL_VERSION,
  };
}
