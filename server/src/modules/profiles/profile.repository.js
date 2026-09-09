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

export function createApplicantEducation(userId, data, database = prisma) {
  return database.applicantEducation.create({
    data: {
      ...data,
      applicantProfile: { connect: { userId } },
    },
  });
}

export function findOwnedApplicantEducation(recordId, userId, database = prisma) {
  return database.applicantEducation.findFirst({
    where: { id: recordId, applicantProfile: { is: { userId } } },
  });
}

export function updateOwnedApplicantEducation(recordId, userId, data, database = prisma) {
  return database.applicantEducation.updateMany({
    where: { id: recordId, applicantProfile: { is: { userId } } },
    data,
  });
}

export function deleteOwnedApplicantEducation(recordId, userId, database = prisma) {
  return database.applicantEducation.deleteMany({
    where: { id: recordId, applicantProfile: { is: { userId } } },
  });
}

export function createApplicantExperience(userId, data, database = prisma) {
  return database.applicantExperience.create({
    data: {
      ...data,
      applicantProfile: { connect: { userId } },
    },
  });
}

export function findOwnedApplicantExperience(recordId, userId, database = prisma) {
  return database.applicantExperience.findFirst({
    where: { id: recordId, applicantProfile: { is: { userId } } },
  });
}

export function updateOwnedApplicantExperience(recordId, userId, data, database = prisma) {
  return database.applicantExperience.updateMany({
    where: { id: recordId, applicantProfile: { is: { userId } } },
    data,
  });
}

export function deleteOwnedApplicantExperience(recordId, userId, database = prisma) {
  return database.applicantExperience.deleteMany({
    where: { id: recordId, applicantProfile: { is: { userId } } },
  });
}

export function createApplicantProject(userId, data, database = prisma) {
  return database.applicantProject.create({
    data: { ...data, applicantProfile: { connect: { userId } } },
  });
}

export function findOwnedApplicantProject(recordId, userId, database = prisma) {
  return database.applicantProject.findFirst({
    where: { id: recordId, applicantProfile: { is: { userId } } },
  });
}

export function updateOwnedApplicantProject(recordId, userId, data, database = prisma) {
  return database.applicantProject.updateMany({
    where: { id: recordId, applicantProfile: { is: { userId } } },
    data,
  });
}

export function deleteOwnedApplicantProject(recordId, userId, database = prisma) {
  return database.applicantProject.deleteMany({
    where: { id: recordId, applicantProfile: { is: { userId } } },
  });
}

export function createApplicantCertification(userId, data, database = prisma) {
  return database.applicantCertification.create({
    data: { ...data, applicantProfile: { connect: { userId } } },
  });
}

export function findOwnedApplicantCertification(recordId, userId, database = prisma) {
  return database.applicantCertification.findFirst({
    where: { id: recordId, applicantProfile: { is: { userId } } },
  });
}

export function updateOwnedApplicantCertification(recordId, userId, data, database = prisma) {
  return database.applicantCertification.updateMany({
    where: { id: recordId, applicantProfile: { is: { userId } } },
    data,
  });
}

export function deleteOwnedApplicantCertification(recordId, userId, database = prisma) {
  return database.applicantCertification.deleteMany({
    where: { id: recordId, applicantProfile: { is: { userId } } },
  });
}

export function findApplicantProfileIdByUserId(userId, database = prisma) {
  return database.applicantProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
}

export function upsertSkillRecord({ name, normalizedName }, database = prisma) {
  return database.skill.upsert({
    where: { normalizedName },
    create: { name, normalizedName },
    update: {},
    select: { id: true, name: true, normalizedName: true },
  });
}

export function deleteApplicantSkills(applicantProfileId, database = prisma) {
  return database.applicantSkill.deleteMany({ where: { applicantProfileId } });
}

export async function createApplicantSkills(applicantProfileId, skills, database = prisma) {
  if (skills.length === 0) return { count: 0 };
  return database.applicantSkill.createMany({
    data: skills.map(({ skillId, proficiency, yearsExperience }) => ({
      applicantProfileId,
      skillId,
      proficiency,
      yearsExperience,
    })),
  });
}

export function findApplicantSkills(applicantProfileId, database = prisma) {
  return database.applicantSkill.findMany({
    where: { applicantProfileId },
    orderBy: { skill: { name: 'asc' } },
    select: {
      proficiency: true,
      yearsExperience: true,
      skill: { select: { id: true, name: true, normalizedName: true } },
    },
  });
}
