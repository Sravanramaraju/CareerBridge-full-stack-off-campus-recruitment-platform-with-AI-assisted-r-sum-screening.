import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { disconnectDatabase } from '../../src/lib/database.js';
import {
  closeIntegrationDatabase,
  integrationDatabase,
  resetIntegrationDatabase,
} from './database.js';
import {
  createCompany,
  createJob,
  createUser,
  integrationOrigin,
  loginUser,
} from './fixtures.js';

let admin;
let recruiter;
let applicant;
let company;
let job;

describe('administrator moderation with PostgreSQL', () => {
  beforeEach(async () => {
    await resetIntegrationDatabase();
    [admin, recruiter, applicant] = await Promise.all([
      createUser({
        id: 'admin',
        email: 'admin@example.com',
        name: 'Admin',
        role: 'ADMIN',
      }),
      createUser({
        id: 'recruiter',
        email: 'recruiter@example.com',
        name: 'Recruiter',
        role: 'RECRUITER',
      }),
      createUser({
        id: 'applicant',
        email: 'applicant@example.com',
        name: 'Applicant',
      }),
    ]);
    company = await createCompany({
      id: 'pending-company',
      ownerId: recruiter.id,
      verificationStatus: 'PENDING',
    });
    job = await createJob({
      id: 'pending-job',
      companyId: company.id,
      recruiterId: recruiter.id,
      moderationStatus: 'PENDING',
    });
  });

  afterAll(async () => {
    await Promise.all([disconnectDatabase(), closeIntegrationDatabase()]);
  });

  it('verifies companies and records recruiter notification, email, and audit evidence', async () => {
    const session = await loginUser(admin.email);
    const response = await session.agent
      .patch(`/api/v1/admin/companies/${company.id}/verification`)
      .set('Origin', integrationOrigin)
      .set('x-csrf-token', session.csrfToken)
      .send({ status: 'VERIFIED' })
      .expect(200);
    expect(response.body.data.verificationStatus).toBe('VERIFIED');
    expect(
      await integrationDatabase.auditLog.count({
        where: { action: 'COMPANY_VERIFICATION_CHANGED', entityId: company.id },
      }),
    ).toBe(1);
    expect(
      await integrationDatabase.notification.count({
        where: { userId: recruiter.id },
      }),
    ).toBe(1);
    expect(
      await integrationDatabase.emailOutbox.count({
        where: { recipient: recruiter.email },
      }),
    ).toBe(1);
  });

  it('moderates jobs and removes flagged roles from the public catalog', async () => {
    const session = await loginUser(admin.email);
    await session.agent
      .patch(`/api/v1/admin/jobs/${job.id}/moderation`)
      .set('Origin', integrationOrigin)
      .set('x-csrf-token', session.csrfToken)
      .send({ action: 'FLAG', reason: 'Role requires a policy review.' })
      .expect(200);

    await session.agent.get(`/api/v1/jobs/${job.id}`).expect(404);
    expect(
      await integrationDatabase.auditLog.count({
        where: { action: 'JOB_MODERATION_CHANGED', entityId: job.id },
      }),
    ).toBe(1);
  });

  it('suspends users, revokes their sessions, and writes security records', async () => {
    await loginUser(applicant.email);
    expect(
      await integrationDatabase.session.count({
        where: { userId: applicant.id },
      }),
    ).toBe(1);

    const adminSession = await loginUser(admin.email);
    const response = await adminSession.agent
      .patch(`/api/v1/admin/users/${applicant.id}/status`)
      .set('Origin', integrationOrigin)
      .set('x-csrf-token', adminSession.csrfToken)
      .send({
        status: 'SUSPENDED',
        reason: 'Confirmed integration security review.',
      })
      .expect(200);
    expect(response.body.data.status).toBe('SUSPENDED');
    expect(
      await integrationDatabase.session.count({
        where: { userId: applicant.id },
      }),
    ).toBe(0);
    expect(
      await integrationDatabase.auditLog.count({
        where: { action: 'USER_STATUS_CHANGED', entityId: applicant.id },
      }),
    ).toBe(1);
    expect(
      await integrationDatabase.notification.count({
        where: { userId: applicant.id, type: 'SECURITY' },
      }),
    ).toBe(1);
  });

  it('denies moderation to non-admin users and self-suspension to administrators', async () => {
    const recruiterSession = await loginUser(recruiter.email);
    await recruiterSession.agent.get('/api/v1/admin/users').expect(403);

    const adminSession = await loginUser(admin.email);
    const response = await adminSession.agent
      .patch(`/api/v1/admin/users/${admin.id}/status`)
      .set('Origin', integrationOrigin)
      .set('x-csrf-token', adminSession.csrfToken)
      .send({
        status: 'SUSPENDED',
        reason: 'Self suspension should be rejected.',
      })
      .expect(409);
    expect(response.body.error.code).toBe('ADMIN_SELF_SUSPENSION');
  });
});
