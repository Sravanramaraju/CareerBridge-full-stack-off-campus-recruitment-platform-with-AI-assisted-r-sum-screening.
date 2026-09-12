import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app.js';
import { disconnectDatabase } from '../../src/lib/database.js';
import { hashPassword } from '../../src/lib/password.js';
import {
  closeIntegrationDatabase,
  integrationDatabase,
  resetIntegrationDatabase,
} from './database.js';

const origin = 'http://localhost:5173';
const applicant = {
  name: 'Integration Applicant',
  email: 'applicant.integration@example.com',
  password: 'secure-pass-123',
  acceptedTerms: true,
};

function cookieValue(response, name) {
  const cookie = response.headers['set-cookie']?.find((value) =>
    value.startsWith(`${name}=`),
  );
  return cookie?.split(';', 1)[0].slice(name.length + 1);
}

describe('authentication with PostgreSQL', () => {
  beforeEach(resetIntegrationDatabase);

  afterAll(async () => {
    await Promise.all([disconnectDatabase(), closeIntegrationDatabase()]);
  });

  it('creates an applicant, restores the cookie session, and logs out with CSRF protection', async () => {
    const agent = request.agent(createApp());
    const signup = await agent
      .post('/api/v1/auth/signup/applicant')
      .set('Origin', origin)
      .send(applicant)
      .expect(201);

    expect(signup.body.data.user).toMatchObject({
      email: applicant.email,
      role: 'APPLICANT',
    });
    expect(signup.body.data.user).not.toHaveProperty('passwordHash');
    expect(await integrationDatabase.applicantProfile.count()).toBe(1);

    const current = await agent.get('/api/v1/auth/me').expect(200);
    expect(current.body.data.user.email).toBe(applicant.email);

    await agent.post('/api/v1/auth/logout').set('Origin', origin).expect(403);
    const csrfToken = cookieValue(signup, 'careerbridge_csrf');
    await agent
      .post('/api/v1/auth/logout')
      .set('Origin', origin)
      .set('x-csrf-token', csrfToken)
      .expect(200);
    await agent.get('/api/v1/auth/me').expect(401);
  });

  it('rejects duplicate signup and invalid login without exposing password hashes', async () => {
    const app = createApp();
    await request(app)
      .post('/api/v1/auth/signup/applicant')
      .set('Origin', origin)
      .send(applicant)
      .expect(201);
    const duplicate = await request(app)
      .post('/api/v1/auth/signup/applicant')
      .set('Origin', origin)
      .send(applicant)
      .expect(409);
    expect(duplicate.body.error.code).toBe('EMAIL_IN_USE');

    const rejected = await request(app)
      .post('/api/v1/auth/login')
      .set('Origin', origin)
      .send({
        email: applicant.email,
        password: 'wrong-password',
        rememberMe: false,
      })
      .expect(401);
    expect(rejected.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(JSON.stringify(rejected.body)).not.toContain('passwordHash');
  });

  it('creates a recruiter with an owned company and enforces role authorization', async () => {
    const agent = request.agent(createApp());
    const signup = await agent
      .post('/api/v1/auth/signup/recruiter')
      .set('Origin', origin)
      .send({
        name: 'Integration Recruiter',
        email: 'recruiter.integration@example.com',
        password: 'secure-pass-123',
        companyName: 'Integration Labs',
        acceptedTerms: true,
      })
      .expect(201);

    expect(signup.body.data.user.role).toBe('RECRUITER');
    const membership = await integrationDatabase.companyMember.findFirst({
      include: { company: true },
    });
    expect(membership).toMatchObject({ role: 'OWNER' });
    expect(membership.company.name).toBe('Integration Labs');
    await agent.get('/api/v1/recruiter/dashboard').expect(200);
    await agent.get('/api/v1/applicant/dashboard').expect(403);
    await agent.get('/api/v1/admin/dashboard').expect(403);
  });

  it('blocks a suspended user even when a session was already established', async () => {
    const passwordHash = await hashPassword(applicant.password);
    const user = await integrationDatabase.user.create({
      data: {
        name: applicant.name,
        email: applicant.email,
        passwordHash,
        role: 'APPLICANT',
        applicantProfile: { create: {} },
        preference: { create: {} },
      },
    });
    const agent = request.agent(createApp());
    await agent
      .post('/api/v1/auth/login')
      .set('Origin', origin)
      .send({
        email: applicant.email,
        password: applicant.password,
        rememberMe: false,
      })
      .expect(200);

    await integrationDatabase.user.update({
      where: { id: user.id },
      data: { status: 'SUSPENDED' },
    });
    await agent.get('/api/v1/auth/me').expect(401);
    await request(createApp())
      .post('/api/v1/auth/login')
      .set('Origin', origin)
      .send({
        email: applicant.email,
        password: applicant.password,
        rememberMe: false,
      })
      .expect(401);
  });
});
