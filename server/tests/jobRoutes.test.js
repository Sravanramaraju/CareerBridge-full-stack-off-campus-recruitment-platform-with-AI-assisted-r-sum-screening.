import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

describe('public job routes', () => {
  it('validates public job filters before database access', async () => {
    const response = await request(createApp())
      .get('/api/v1/jobs?sort=random&types=Volunteer&pageSize=100')
      .expect(422);

    expect(response.body.error).toMatchObject({
      code: 'VALIDATION_ERROR',
      fields: {
        'query.sort': expect.any(String),
        'query.types.0': expect.any(String),
        'query.pageSize': expect.any(String),
      },
    });
  });
});
