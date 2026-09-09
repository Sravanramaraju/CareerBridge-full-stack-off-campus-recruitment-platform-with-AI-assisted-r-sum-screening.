import { prisma } from '../../lib/database.js';

const orderedProfileRecord = { orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] };

const applicantProfileSelection = {
  id: true,
  headline: true,
  phone: true,
  location: true,
  summary: true,
  preferredLocations: true,
  preferredJobTypes: true,
  preferredWorkModes: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, name: true, email: true } },
  applicantEducations: {
    ...orderedProfileRecord,
    select: {
      id: true,
      institution: true,
      qualification: true,
      fieldOfStudy: true,
      startYear: true,
      endYear: true,
      isCurrent: true,
      grade: true,
      description: true,
      displayOrder: true,
    },
  },
  experiences: {
    ...orderedProfileRecord,
    select: {
      id: true,
      title: true,
      organization: true,
      location: true,
      employmentType: true,
      startDate: true,
      endDate: true,
      isCurrent: true,
      description: true,
      displayOrder: true,
    },
  },
  projects: {
    ...orderedProfileRecord,
    select: {
      id: true,
      name: true,
      description: true,
      projectUrl: true,
      repositoryUrl: true,
      technologies: true,
      startedAt: true,
      completedAt: true,
      displayOrder: true,
    },
  },
  certifications: {
    ...orderedProfileRecord,
    select: {
      id: true,
      name: true,
      issuer: true,
      issuedAt: true,
      expiresAt: true,
      credentialId: true,
      credentialUrl: true,
      displayOrder: true,
    },
  },
  skills: {
    orderBy: { skill: { name: 'asc' } },
    select: {
      proficiency: true,
      yearsExperience: true,
      skill: { select: { id: true, name: true, normalizedName: true } },
    },
  },
  resumes: {
    where: { deletedAt: null },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      originalFileName: true,
      mimeType: true,
      fileSize: true,
      isPrimary: true,
      parseStatus: true,
      createdAt: true,
      updatedAt: true,
    },
  },
};

export function findApplicantProfileByUserId(userId, database = prisma) {
  return database.applicantProfile.findUnique({
    where: { userId },
    select: applicantProfileSelection,
  });
}

export function updateApplicantUserName(userId, name, database = prisma) {
  return database.user.update({
    where: { id: userId },
    data: { name },
    select: { id: true },
  });
}

export function updateApplicantProfileRecord(userId, updates, database = prisma) {
  return database.applicantProfile.update({
    where: { userId },
    data: updates,
    select: applicantProfileSelection,
  });
}
