import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

describe('recruiter company routes', () => {
  it('requires authentication before returning a recruiter company', async () => {
    const response = await request(createApp()).get('/api/v1/recruiter/company').expect(401);

    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('requires authentication before accepting company updates', async () => {
    const response = await request(createApp())
      .patch('/api/v1/recruiter/company')
      .send({ name: 'Unauthorized update' })
      .expect(401);

    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });
});
