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

describe('applicant education routes', () => {
  it.each([
    ['post', '/api/v1/applicant/education'],
    ['patch', '/api/v1/applicant/education/education-1'],
    ['delete', '/api/v1/applicant/education/education-1'],
  ])('requires authentication for %s %s', async (method, path) => {
    const response = await request(createApp())[method](path).send({}).expect(401);

    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });
});

describe('applicant experience routes', () => {
  it.each([
    ['post', '/api/v1/applicant/experience'],
    ['patch', '/api/v1/applicant/experience/experience-1'],
    ['delete', '/api/v1/applicant/experience/experience-1'],
  ])('requires authentication for %s %s', async (method, path) => {
    const response = await request(createApp())[method](path).send({}).expect(401);

    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });
});

describe('applicant project routes', () => {
  it.each([
    ['post', '/api/v1/applicant/projects'],
    ['patch', '/api/v1/applicant/projects/project-1'],
    ['delete', '/api/v1/applicant/projects/project-1'],
  ])('requires authentication for %s %s', async (method, path) => {
    const response = await request(createApp())[method](path).send({}).expect(401);

    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });
});

describe('applicant certification routes', () => {
  it.each([
    ['post', '/api/v1/applicant/certifications'],
    ['patch', '/api/v1/applicant/certifications/certification-1'],
    ['delete', '/api/v1/applicant/certifications/certification-1'],
  ])('requires authentication for %s %s', async (method, path) => {
    const response = await request(createApp())[method](path).send({}).expect(401);

    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });
});
