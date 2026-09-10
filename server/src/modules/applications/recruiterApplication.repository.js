import { prisma } from '../../lib/database.js';

const candidateSelection = {
  id: true,
  jobId: true,
  resumeId: true,
  status: true,
  appliedAt: true,
  updatedAt: true,
  applicant: {
    select: {
      id: true,
      name: true,
      email: true,
      applicantProfile: {
        select: {
          headline: true,
          location: true,
          experiences: {
            select: { startDate: true, endDate: true, isCurrent: true },
          },
          skills: {
            orderBy: { skill: { name: 'asc' } },
            select: {
              proficiency: true,
              yearsExperience: true,
              skill: { select: { id: true, name: true, normalizedName: true } },
            },
          },
        },
      },
    },
  },
  match: {
    select: {
      overallScore: true,
      requiredSkillScore: true,
      preferredSkillScore: true,
      experienceScore: true,
      preferenceScore: true,
      semanticScore: true,
      semanticAvailable: true,
      requiredSkillsMatched: true,
      requiredSkillsMissing: true,
      preferredSkillsMatched: true,
      explanation: true,
      modelVersion: true,
      calculatedAt: true,
    },
  },
};

function candidateSearch(q) {
  return {
    applicant: {
      is: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { applicantProfile: { is: { headline: { contains: q, mode: 'insensitive' } } } },
          {
            applicantProfile: {
              is: {
                skills: {
                  some: { skill: { is: { name: { contains: q, mode: 'insensitive' } } } },
                },
              },
            },
          },
        ],
      },
    },
  };
}

function buildCandidateWhere(jobId, filters) {
  const applicantFilters = [];
  if (filters.location) applicantFilters.push({
    applicant: {
      is: {
        applicantProfile: {
          is: { location: { contains: filters.location, mode: 'insensitive' } },
        },
      },
    },
  });
  if (filters.q) applicantFilters.push(candidateSearch(filters.q));
  return {
    jobId,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.minMatch > 0 ? { match: { is: { overallScore: { gte: filters.minMatch } } } } : {}),
    ...(applicantFilters.length > 0 ? { AND: applicantFilters } : {}),
  };
}

export function listRecruiterJobApplicationCandidates(jobId, filters, database = prisma) {
  return database.application.findMany({
    where: buildCandidateWhere(jobId, filters),
    orderBy: [{ appliedAt: 'desc' }, { id: 'desc' }],
    select: candidateSelection,
  });
}
