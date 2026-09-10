import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { recruiterJobRouter } from '../src/modules/jobs/recruiterJob.routes.js';

function createAuthorizedRouterApp(role) {
  const app = express();
  app.use(express.json());
  app.use((incoming, _response, next) => {
    incoming.auth = { user: { id: 'user-1', role } };
    next();
  });
  app.use('/api/v1/recruiter/jobs', recruiterJobRouter);
  app.use(errorHandler);
  return app;
}

describe('recruiter job routes', () => {
  it.each([
    ['get', '/api/v1/recruiter/jobs'],
    ['post', '/api/v1/recruiter/jobs'],
    ['get', '/api/v1/recruiter/jobs/job-1'],
    ['patch', '/api/v1/recruiter/jobs/job-1'],
    ['post', '/api/v1/recruiter/jobs/job-1/publish'],
    ['post', '/api/v1/recruiter/jobs/job-1/close'],
    ['post', '/api/v1/recruiter/jobs/job-1/reopen'],
    ['delete', '/api/v1/recruiter/jobs/job-1'],
  ])('requires authentication for %s %s', async (method, path) => {
    const response = await request(createApp())[method](path).expect(401);
    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('allows only recruiters to access job management', async () => {
    const response = await request(createAuthorizedRouterApp('APPLICANT'))
      .get('/api/v1/recruiter/jobs')
      .expect(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('rejects unknown draft fields before calling application services', async () => {
    const response = await request(createAuthorizedRouterApp('RECRUITER'))
      .post('/api/v1/recruiter/jobs')
      .send({ unsupportedField: true })
      .expect(422);
    expect(response.body.error).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('validates lifecycle job identifiers', async () => {
    const oversizedId = 'j'.repeat(129);
    const response = await request(createAuthorizedRouterApp('RECRUITER'))
      .post(`/api/v1/recruiter/jobs/${oversizedId}/publish`)
      .expect(422);
    expect(response.body.error.fields).toHaveProperty('params.jobId');
  });

  it('rejects empty patch bodies before calling application services', async () => {
    const response = await request(createAuthorizedRouterApp('RECRUITER'))
      .patch('/api/v1/recruiter/jobs/job-1')
      .send({})
      .expect(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
