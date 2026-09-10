import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { applicantDashboardRouter } from '../src/modules/dashboard/applicantDashboard.routes.js';

function createAuthorizedApp(role) {
  const app = express();
  app.use((incoming, _response, next) => {
    incoming.auth = { user: { id: 'user-1', role } };
    next();
  });
  app.use('/api/v1/applicant/dashboard', applicantDashboardRouter);
  app.use(errorHandler);
  return app;
}

describe('applicant dashboard routes', () => {
  it('requires authentication', async () => {
    const response = await request(createApp()).get('/api/v1/applicant/dashboard').expect(401);
    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it.each(['RECRUITER', 'ADMIN'])('rejects %s access', async (role) => {
    const response = await request(createAuthorizedApp(role))
      .get('/api/v1/applicant/dashboard')
      .expect(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });
});
