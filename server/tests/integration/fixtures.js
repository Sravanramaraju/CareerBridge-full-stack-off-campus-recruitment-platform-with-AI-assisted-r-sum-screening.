import request from 'supertest';
import { createApp } from '../../src/app.js';
import { hashPassword } from '../../src/lib/password.js';
import { integrationDatabase } from './database.js';

export const integrationOrigin = 'http://localhost:5173';
export const integrationPassword = 'secure-pass-123';

export function cookieValue(response, name) {
  const cookie = response.headers['set-cookie']?.find((value) =>
    value.startsWith(`${name}=`),
  );
  return cookie?.split(';', 1)[0].slice(name.length + 1);
}

export async function createUser({
  id,
  email,
  name,
  role = 'APPLICANT',
  status = 'ACTIVE',
}) {
  const passwordHash = await hashPassword(integrationPassword);
  return integrationDatabase.user.create({
    data: {
      id,
      email,
      name,
      role,
      status,
      passwordHash,
      preference: { create: {} },
      ...(role === 'APPLICANT'
        ? { applicantProfile: { create: { id: `profile-${id}` } } }
        : {}),
      ...(role === 'RECRUITER'
        ? { recruiterProfile: { create: { id: `profile-${id}` } } }
        : {}),
    },
    include: { applicantProfile: true },
  });
}

export async function loginUser(email) {
  const agent = request.agent(createApp());
  const response = await agent
    .post('/api/v1/auth/login')
    .set('Origin', integrationOrigin)
    .send({ email, password: integrationPassword, rememberMe: false })
    .expect(200);
  return {
    agent,
    csrfToken: cookieValue(response, 'careerbridge_csrf'),
    user: response.body.data.user,
  };
}

export function createCompany({
  id,
  ownerId,
  verificationStatus = 'VERIFIED',
}) {
  return integrationDatabase.company.create({
    data: {
      id,
      slug: id,
      name: `${id} Company`,
      description: 'Integration-test company.',
      verificationStatus,
      members: { create: { userId: ownerId, role: 'OWNER' } },
    },
  });
}

export function createJob({
  id,
  companyId,
  recruiterId,
  status = 'PUBLISHED',
  moderationStatus = 'CLEARED',
  deadline = new Date(Date.now() + 86_400_000),
}) {
  return integrationDatabase.job.create({
    data: {
      id,
      slug: id,
      companyId,
      createdByUserId: recruiterId,
      title: 'Integration Engineer',
      location: 'Hyderabad, Telangana',
      workMode: 'HYBRID',
      employmentType: 'FULL_TIME',
      experienceMin: 0,
      experienceMax: 2,
      summary: 'Build and verify dependable platform workflows.',
      description:
        'A complete integration-test role description with enough detail for publication.',
      responsibilities: ['Build tested features', 'Collaborate with the team'],
      qualification: 'Relevant project or work evidence.',
      status,
      moderationStatus,
      deadline,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
    },
  });
}

export function createResume({ id, applicantProfileId, suffix = '1' }) {
  return integrationDatabase.resume.create({
    data: {
      id,
      applicantProfileId,
      originalFileName: 'integration-resume.pdf',
      storageKey: `resumes/2026/09/10000000-0000-4000-8000-${suffix.padStart(12, '0')}.pdf`,
      mimeType: 'application/pdf',
      fileSize: 512,
      isPrimary: true,
      parseStatus: 'READY',
      extractedText: 'Integration test resume with relevant project evidence.',
    },
  });
}
