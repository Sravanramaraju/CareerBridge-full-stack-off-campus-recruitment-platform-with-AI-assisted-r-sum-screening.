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

  it('validates company identifiers before detail lookup', async () => {
    const oversizedIdentifier = 'x'.repeat(129);
    const response = await request(createApp())
      .get(`/api/v1/companies/${oversizedIdentifier}`)
      .expect(422);

    expect(response.body.error.fields['params.companyId']).toEqual(expect.any(String));
  });

  it('validates filters on a company-specific jobs collection', async () => {
    const response = await request(createApp())
      .get('/api/v1/companies/northstar-labs/jobs?page=0')
      .expect(422);

    expect(response.body.error.fields['query.page']).toEqual(expect.any(String));
  });
});
