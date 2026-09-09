import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

describe('health API', () => {
  it('returns the API and injected database status', async () => {
    const response = await request(createApp({ databaseCheck: async () => ({ status: 'up' }) }))
      .get('/api/v1/health')
      .expect(200);

    expect(response.body.data.status).toBe('ok');
    expect(response.body.data.database).toEqual({ status: 'up' });
    expect(response.body.data.timestamp).toEqual(expect.any(String));
    expect(response.headers['x-request-id']).toEqual(expect.any(String));
  });

  it('returns the consistent error envelope for missing routes', async () => {
    const response = await request(createApp()).get('/api/v1/missing').expect(404);

    expect(response.body.error).toMatchObject({
      code: 'NOT_FOUND',
      requestId: expect.any(String),
    });
  });

  it('reports a degraded API when PostgreSQL is unavailable', async () => {
    const response = await request(createApp({ databaseCheck: async () => ({ status: 'down' }) }))
      .get('/api/v1/health')
      .expect(200);

    expect(response.body.data).toMatchObject({
      status: 'degraded',
      database: { status: 'down' },
    });
  });

  it('rejects unsafe requests from an untrusted origin', async () => {
    const response = await request(createApp())
      .post('/api/v1/missing')
      .set('Origin', 'https://attacker.example')
      .expect(403);

    expect(response.body.error.code).toBe('INVALID_ORIGIN');
  });
});
