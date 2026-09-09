import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

describe('public company routes', () => {
  it('validates collection pagination before querying companies', async () => {
    const response = await request(createApp())
      .get('/api/v1/companies?page=0&pageSize=100')
      .expect(422);

    expect(response.body.error).toMatchObject({
      code: 'VALIDATION_ERROR',
      fields: {
        'query.page': expect.any(String),
        'query.pageSize': expect.any(String),
      },
    });
  });
});
