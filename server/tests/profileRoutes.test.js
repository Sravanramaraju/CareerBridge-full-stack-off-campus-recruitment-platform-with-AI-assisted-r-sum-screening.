import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

describe('applicant profile routes', () => {
  it('requires authentication before exposing applicant profile data', async () => {
    const response = await request(createApp()).get('/api/v1/applicant/profile').expect(401);

    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('requires authentication before accepting profile updates', async () => {
    const response = await request(createApp())
      .patch('/api/v1/applicant/profile')
      .send({ headline: 'Unauthorized update' })
      .expect(401);

    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });
});
