import { prisma } from '../../lib/database.js';

export function createApplicationMatch(applicationId, match, database = prisma) {
  return database.applicationMatch.create({
    data: {
      applicationId,
      overallScore: match.overallScore,
      requiredSkillScore: match.requiredSkillScore,
      preferredSkillScore: match.preferredSkillScore,
      experienceScore: match.experienceScore,
      preferenceScore: match.preferenceScore,
      semanticScore: match.semanticScore,
      semanticAvailable: match.semanticAvailable,
      requiredSkillsMatched: match.requiredSkillsMatched,
      requiredSkillsMissing: match.requiredSkillsMissing,
      preferredSkillsMatched: match.preferredSkillsMatched,
      explanation: match.explanation,
      modelVersion: match.modelVersion,
    },
  });
}
