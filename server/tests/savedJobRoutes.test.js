import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { applicantSavedJobRouter } from '../src/modules/savedJobs/savedJob.routes.js';

function createAuthorizedRouterApp(role) {
  const app = express();
  app.use((incoming, _response, next) => {
    incoming.auth = { user: { id: 'user-1', role } };
    next();
  });
  app.use('/api/v1/applicant/saved-jobs', applicantSavedJobRouter);
  app.use(errorHandler);
  return app;
}

describe('saved job routes', () => {
  it.each([
    ['get', '/api/v1/applicant/saved-jobs'],
    ['put', '/api/v1/applicant/saved-jobs/job-1'],
    ['delete', '/api/v1/applicant/saved-jobs/job-1'],
  ])('requires authentication for %s %s', async (method, path) => {
    const response = await request(createApp())[method](path).expect(401);
    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('allows only applicant accounts to manage saved jobs', async () => {
    const response = await request(createAuthorizedRouterApp('RECRUITER'))
      .get('/api/v1/applicant/saved-jobs')
      .expect(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it.each(['put', 'delete'])('validates job identifiers for %s operations', async (method) => {
    const response = await request(createAuthorizedRouterApp('APPLICANT'))[method](
      `/api/v1/applicant/saved-jobs/${'j'.repeat(129)}`,
    ).expect(422);
    expect(response.body.error.fields).toHaveProperty('params.jobId');
  });
});
