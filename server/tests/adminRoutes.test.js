import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { adminRouter } from '../src/modules/admin/admin.routes.js';

function createAuthorizedApp(role) {
  const app = express();
  app.use(express.json());
  app.use((incoming, _response, next) => {
    incoming.auth = { user: { id: 'user-1', role } };
    next();
  });
  app.use('/api/v1/admin', adminRouter);
  app.use(errorHandler);
  return app;
}

describe('admin routes', () => {
  it.each([
    ['get', '/api/v1/admin/dashboard'],
    ['get', '/api/v1/admin/companies'],
    ['patch', '/api/v1/admin/companies/company-1/verification'],
  ])('requires authentication for %s %s', async (method, path) => {
    const response = await request(createApp())[method](path).expect(401);
    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it.each(['APPLICANT', 'RECRUITER'])('rejects %s access to admin APIs', async (role) => {
    const response = await request(createAuthorizedApp(role))
      .get('/api/v1/admin/dashboard')
      .expect(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('validates company moderation filters', async () => {
    const response = await request(createAuthorizedApp('ADMIN'))
      .get('/api/v1/admin/companies?pageSize=51')
      .expect(422);
    expect(response.body.error.fields).toHaveProperty('query.pageSize');
  });

  it('requires an adverse company verification reason', async () => {
    const response = await request(createAuthorizedApp('ADMIN'))
      .patch('/api/v1/admin/companies/company-1/verification')
      .send({ status: 'REJECTED' })
      .expect(422);
    expect(response.body.error.fields).toHaveProperty('body.reason');
  });
});
