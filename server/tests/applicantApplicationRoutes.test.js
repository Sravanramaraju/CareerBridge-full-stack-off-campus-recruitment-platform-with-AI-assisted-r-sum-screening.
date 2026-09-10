import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { applicantApplicationRouter } from '../src/modules/applications/applicantApplication.routes.js';

function createAuthorizedApp(role) {
  const app = express();
  app.use((incoming, _response, next) => {
    incoming.auth = { user: { id: 'user-1', role } };
    next();
  });
  app.use('/api/v1/applicant/applications', applicantApplicationRouter);
  app.use(errorHandler);
  return app;
}

describe('applicant application routes', () => {
  it.each([
    '/api/v1/applicant/applications',
    '/api/v1/applicant/applications/application-1',
  ])('requires authentication for %s', async (path) => {
    const response = await request(createApp()).get(path).expect(401);
    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('rejects recruiter access to applicant history', async () => {
    const response = await request(createAuthorizedApp('RECRUITER'))
      .get('/api/v1/applicant/applications')
      .expect(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('validates application detail identifiers before service access', async () => {
    const response = await request(createAuthorizedApp('APPLICANT'))
      .get(`/api/v1/applicant/applications/${'a'.repeat(129)}`)
      .expect(422);
    expect(response.body.error.fields).toHaveProperty('params.applicationId');
  });
});
