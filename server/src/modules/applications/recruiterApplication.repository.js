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

const recruiterApplicationDetailSelection = {
  id: true,
  jobId: true,
  resumeId: true,
  coverNote: true,
  status: true,
  appliedAt: true,
  updatedAt: true,
  job: {
    select: {
      id: true,
      title: true,
      status: true,
      company: { select: { id: true, name: true, slug: true } },
    },
  },
  applicant: {
    select: {
      id: true,
      name: true,
      email: true,
      applicantProfile: {
        select: {
          id: true,
          headline: true,
          phone: true,
          location: true,
          summary: true,
          preferredLocations: true,
          preferredJobTypes: true,
          preferredWorkModes: true,
          applicantEducations: { orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] },
          experiences: { orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] },
          projects: { orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] },
          certifications: { orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] },
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
  resume: {
    select: {
      id: true,
      originalFileName: true,
      mimeType: true,
      fileSize: true,
      parseStatus: true,
      createdAt: true,
    },
  },
  screeningAnswers: {
    select: { id: true, questionId: true, questionSnapshot: true, answer: true },
    orderBy: { createdAt: 'asc' },
  },
  statusHistory: {
    select: {
      id: true,
      previousStatus: true,
      newStatus: true,
      reason: true,
      createdAt: true,
      changedBy: { select: { id: true, name: true, role: true } },
    },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  },
  match: candidateSelection.match,
  recruiterNotes: {
    select: {
      id: true,
      body: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { id: true, name: true } },
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  },
};

export function findRecruiterApplicationDetail(applicationId, companyId, database = prisma) {
  return database.application.findFirst({
    where: { id: applicationId, job: { is: { companyId } } },
    select: recruiterApplicationDetailSelection,
  });
}
