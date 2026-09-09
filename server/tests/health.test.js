import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

describe('health API', () => {
  it('returns the API and injected database status', async () => {
    const response = await request(createApp({ databaseCheck: async () => ({ status: 'up' }) }))
      .get('/api/v1/health')
      .expect(200);

    expect(response.body.data.status).toBe('ok');
    expect(response.body.data.database).toEqual({ status: 'up' });
    expect(response.body.data.timestamp).toEqual(expect.any(String));
    expect(response.headers['x-request-id']).toEqual(expect.any(String));
  });

  it('returns the consistent error envelope for missing routes', async () => {
    const response = await request(createApp()).get('/api/v1/missing').expect(404);

    expect(response.body.error).toMatchObject({
      code: 'NOT_FOUND',
      requestId: expect.any(String),
    });
  });

  it('reports a degraded API when PostgreSQL is unavailable', async () => {
    const response = await request(createApp({ databaseCheck: async () => ({ status: 'down' }) }))
      .get('/api/v1/health')
      .expect(200);

    expect(response.body.data).toMatchObject({
      status: 'degraded',
      database: { status: 'down' },
    });
  });

  it('rejects unsafe requests from an untrusted origin', async () => {
    const response = await request(createApp())
      .post('/api/v1/missing')
      .set('Origin', 'https://attacker.example')
      .expect(403);

    expect(response.body.error.code).toBe('INVALID_ORIGIN');
  });

  it('validates login input before accessing authentication services', async () => {
    const response = await request(createApp())
      .post('/api/v1/auth/login')
      .send({ email: 'invalid', password: '' })
      .expect(422);

    expect(response.body.error).toMatchObject({
      code: 'VALIDATION_ERROR',
      fields: {
        'body.email': expect.any(String),
        'body.password': expect.any(String),
      },
    });
  });

  it('protects the current-session endpoint', async () => {
    const response = await request(createApp()).get('/api/v1/auth/me').expect(401);

    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('keeps logout idempotent when no session cookie exists', async () => {
    const response = await request(createApp()).post('/api/v1/auth/logout').expect(200);

    expect(response.body.data.loggedOut).toBe(true);
  });

  it('validates applicant signup before opening a transaction', async () => {
    const response = await request(createApp())
      .post('/api/v1/auth/signup/applicant')
      .send({ name: '', email: 'invalid', password: 'short', acceptedTerms: false })
      .expect(422);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('requires company identity during recruiter signup', async () => {
    const response = await request(createApp())
      .post('/api/v1/auth/signup/recruiter')
      .send({
        name: 'Rohan Mehta',
        companyName: '',
        email: 'rohan@example.com',
        password: 'password',
        acceptedTerms: true,
      })
      .expect(422);

    expect(response.body.error.fields['body.companyName']).toEqual(expect.any(String));
  });

  it('validates forgot-password email input before database access', async () => {
    const response = await request(createApp())
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'invalid' })
      .expect(422);

    expect(response.body.error.fields['body.email']).toEqual(expect.any(String));
  });

  it('validates reset credentials before password recovery services run', async () => {
    const response = await request(createApp())
      .post('/api/v1/auth/reset-password')
      .send({ token: 'short', password: 'short' })
      .expect(422);

    expect(response.body.error.fields).toMatchObject({
      'body.token': expect.any(String),
      'body.password': expect.any(String),
    });
  });
});
