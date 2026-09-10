import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { recruiterApplicationRouter } from '../src/modules/applications/recruiterApplication.routes.js';
import { recruiterJobRouter } from '../src/modules/jobs/recruiterJob.routes.js';

function createAuthorizedApp(role) {
  const app = express();
  app.use((incoming, _response, next) => {
    incoming.auth = { user: { id: 'user-1', role } };
    next();
  });
  app.use('/api/v1/recruiter/jobs', recruiterJobRouter);
  app.use('/api/v1/recruiter/applications', recruiterApplicationRouter);
  app.use(errorHandler);
  return app;
}

describe('recruiter application routes', () => {
  it.each([
    '/api/v1/recruiter/jobs/job-1/applications',
    '/api/v1/recruiter/applications/application-1',
  ])('requires authentication for %s', async (path) => {
    const response = await request(createApp()).get(path).expect(401);
    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('rejects applicant access to recruiter candidate data', async () => {
    const response = await request(createAuthorizedApp('APPLICANT'))
      .get('/api/v1/recruiter/applications/application-1')
      .expect(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('validates pipeline filters before database access', async () => {
    const response = await request(createAuthorizedApp('RECRUITER'))
      .get('/api/v1/recruiter/jobs/job-1/applications?minMatch=101&page=0')
      .expect(422);
    expect(response.body.error.fields).toMatchObject({
      'query.minMatch': expect.any(String),
      'query.page': expect.any(String),
    });
  });

  it('validates recruiter application detail identifiers', async () => {
    const response = await request(createAuthorizedApp('RECRUITER'))
      .get(`/api/v1/recruiter/applications/${'a'.repeat(129)}`)
      .expect(422);
    expect(response.body.error.fields).toHaveProperty('params.applicationId');
  });
});
