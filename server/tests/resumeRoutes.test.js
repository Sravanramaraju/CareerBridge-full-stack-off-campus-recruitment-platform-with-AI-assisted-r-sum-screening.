import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

describe('applicant resume routes', () => {
  it.each([
    ['get', '/api/v1/applicant/resumes'],
    ['post', '/api/v1/applicant/resumes'],
    ['patch', '/api/v1/applicant/resumes/resume-1/primary'],
    ['delete', '/api/v1/applicant/resumes/resume-1'],
  ])('requires authentication before %s %s', async (method, path) => {
    const response = await request(createApp())[method](path).expect(401);
    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });
});
