import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { jobRouter } from '../src/modules/jobs/job.routes.js';

function createAuthorizedJobApp(role) {
  const app = express();
  app.use(express.json());
  app.use((incoming, _response, next) => {
    incoming.auth = { user: { id: 'user-1', role } };
    next();
  });
  app.use('/api/v1/jobs', jobRouter);
  app.use(errorHandler);
  return app;
}

describe('application submission route', () => {
  it('requires authentication to submit an application', async () => {
    const response = await request(createApp())
      .post('/api/v1/jobs/job-1/applications')
      .send({ resumeId: 'resume-1' })
      .expect(401);
    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('allows only applicants to submit applications', async () => {
    const response = await request(createAuthorizedJobApp('RECRUITER'))
      .post('/api/v1/jobs/job-1/applications')
      .send({ resumeId: 'resume-1' })
      .expect(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('validates the submission before application services run', async () => {
    const response = await request(createAuthorizedJobApp('APPLICANT'))
      .post('/api/v1/jobs/job-1/applications')
      .send({ resumeId: '', coverNote: 'x'.repeat(501) })
      .expect(422);
    expect(response.body.error.fields).toMatchObject({
      'body.resumeId': expect.any(String),
      'body.coverNote': expect.any(String),
    });
  });
});
