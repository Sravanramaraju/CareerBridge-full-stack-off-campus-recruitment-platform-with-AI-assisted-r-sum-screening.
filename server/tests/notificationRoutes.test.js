import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { notificationRouter } from '../src/modules/notifications/notification.routes.js';

function createAuthorizedApp(role = 'APPLICANT') {
  const app = express();
  app.use((incoming, _response, next) => {
    incoming.auth = { user: { id: 'user-1', role } };
    next();
  });
  app.use('/api/v1/notifications', notificationRouter);
  app.use(errorHandler);
  return app;
}

describe('notification routes', () => {
  it.each([
    ['get', '/api/v1/notifications'],
    ['patch', '/api/v1/notifications/read-all'],
    ['patch', '/api/v1/notifications/notification-1/read'],
  ])('requires authentication for %s %s', async (method, path) => {
    const response = await request(createApp())[method](path).expect(401);
    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('rejects role query parameters instead of trusting client authorization claims', async () => {
    const response = await request(createAuthorizedApp())
      .get('/api/v1/notifications?role=ADMIN')
      .expect(422);
    expect(response.body.error.fields).toHaveProperty('query');
  });

  it('validates notification identifiers before ownership checks', async () => {
    const response = await request(createAuthorizedApp())
      .patch(`/api/v1/notifications/${'a'.repeat(129)}/read`)
      .expect(422);
    expect(response.body.error.fields).toHaveProperty('params.notificationId');
  });
});
