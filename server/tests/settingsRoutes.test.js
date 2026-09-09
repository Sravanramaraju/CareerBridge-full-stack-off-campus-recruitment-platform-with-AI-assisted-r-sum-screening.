import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

describe('settings routes', () => {
  it.each([
    ['get', '/api/v1/settings'],
    ['patch', '/api/v1/settings'],
  ])('requires authentication for %s %s', async (method, path) => {
    const response = await request(createApp())[method](path).send({}).expect(401);

    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });
});
