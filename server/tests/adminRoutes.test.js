import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { adminRouter } from '../src/modules/admin/admin.routes.js';

function createAuthorizedApp(role) {
  const app = express();
  app.use((incoming, _response, next) => {
    incoming.auth = { user: { id: 'user-1', role } };
    next();
  });
  app.use('/api/v1/admin', adminRouter);
  app.use(errorHandler);
  return app;
}

describe('admin routes', () => {
  it('requires authentication for the admin dashboard', async () => {
    const response = await request(createApp()).get('/api/v1/admin/dashboard').expect(401);
    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it.each(['APPLICANT', 'RECRUITER'])('rejects %s access to admin APIs', async (role) => {
    const response = await request(createAuthorizedApp(role))
      .get('/api/v1/admin/dashboard')
      .expect(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });
});
