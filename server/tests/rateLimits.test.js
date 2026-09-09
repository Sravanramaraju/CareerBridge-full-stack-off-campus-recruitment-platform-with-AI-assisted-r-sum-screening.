import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createRequestRateLimit } from '../src/middleware/rateLimits.js';

describe('request rate limiting', () => {
  it('returns the API error envelope after the configured limit', async () => {
    const app = express();
    app.use((incomingRequest, _response, next) => {
      incomingRequest.id = 'request-id';
      next();
    });
    app.get('/limited', createRequestRateLimit({ windowMs: 60_000, max: 1 }), (_request, response) => {
      response.json({ data: { ok: true } });
    });

    await request(app).get('/limited').expect(200);
    const response = await request(app).get('/limited').expect(429);

    expect(response.body.error).toEqual({
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please wait before trying again.',
      requestId: 'request-id',
    });
  });
});
