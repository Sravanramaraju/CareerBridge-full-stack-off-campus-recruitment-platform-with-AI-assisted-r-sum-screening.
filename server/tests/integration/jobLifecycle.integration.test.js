import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { disconnectDatabase } from '../../src/lib/database.js';
import {
  closeIntegrationDatabase,
  resetIntegrationDatabase,
} from './database.js';
import {
  createCompany,
  createUser,
  integrationOrigin,
  loginUser,
} from './fixtures.js';

let recruiter;
let otherRecruiter;

const completeJob = {
  title: 'Graduate Platform Engineer',
  department: 'Engineering',
  category: 'Software development',
  location: 'Hyderabad, Telangana',
  workMode: 'HYBRID',
  employmentType: 'FULL_TIME',
  openings: 2,
  experienceMin: 0,
  experienceMax: 2,
  salaryMin: 600000,
  salaryMax: 900000,
  currency: 'INR',
  hideSalary: false,
  summary: 'Build dependable platform services for early-career recruitment.',
  description:
    'Work with a multidisciplinary team to build, test, document, and improve dependable recruitment platform services.',
  responsibilities: [
    'Implement scoped product capabilities',
    'Review and test changes with teammates',
  ],
  qualification:
    'Relevant project, coursework, internship, or employment evidence.',
  contactVisible: true,
  deadline: new Date(Date.now() + 7 * 86_400_000).toISOString(),
  skills: [
    { name: 'Node.js', requirement: 'REQUIRED' },
    { name: 'PostgreSQL', requirement: 'PREFERRED' },
  ],
  screeningQuestions: [
    {
      question: 'Which project best demonstrates your relevant skills?',
      required: true,
    },
  ],
};

describe('recruiter job lifecycle with PostgreSQL', () => {
  beforeEach(async () => {
    await resetIntegrationDatabase();
    [recruiter, otherRecruiter] = await Promise.all([
      createUser({
        id: 'job-recruiter',
        email: 'job-recruiter@example.com',
        name: 'Job Recruiter',
        role: 'RECRUITER',
      }),
      createUser({
        id: 'other-job-recruiter',
        email: 'other-job-recruiter@example.com',
        name: 'Other Recruiter',
        role: 'RECRUITER',
      }),
    ]);
    await createCompany({ id: 'job-company', ownerId: recruiter.id });
    await createCompany({
      id: 'other-job-company',
      ownerId: otherRecruiter.id,
    });
  });

  afterAll(async () => {
    await Promise.all([disconnectDatabase(), closeIntegrationDatabase()]);
  });

  it('creates and updates a relational draft with normalized skills and questions', async () => {
    const session = await loginUser(recruiter.email);
    const created = await session.agent
      .post('/api/v1/recruiter/jobs')
      .set('Origin', integrationOrigin)
      .set('x-csrf-token', session.csrfToken)
      .send({
        title: '  Platform Intern  ',
        skills: [{ name: '  JAVASCRIPT ', requirement: 'REQUIRED' }],
      })
      .expect(201);
    expect(created.body.data).toMatchObject({
      title: 'Platform Intern',
      status: 'DRAFT',
    });
    expect(created.body.data.skills[0].skill.normalizedName).toBe('javascript');

    const updated = await session.agent
      .patch(`/api/v1/recruiter/jobs/${created.body.data.id}`)
      .set('Origin', integrationOrigin)
      .set('x-csrf-token', session.csrfToken)
      .send({ ...completeJob, title: 'Platform Intern' })
      .expect(200);
    expect(updated.body.data.skills).toHaveLength(2);
    expect(updated.body.data.screeningQuestions).toHaveLength(1);
  });

  it('publishes, closes, reopens, and archives a complete job in chronological state order', async () => {
    const session = await loginUser(recruiter.email);
    const draft = await session.agent
      .post('/api/v1/recruiter/jobs')
      .set('Origin', integrationOrigin)
      .set('x-csrf-token', session.csrfToken)
      .send(completeJob)
      .expect(201);
    const jobId = draft.body.data.id;

    const published = await session.agent
      .post(`/api/v1/recruiter/jobs/${jobId}/publish`)
      .set('Origin', integrationOrigin)
      .set('x-csrf-token', session.csrfToken)
      .expect(200);
    expect(published.body.data).toMatchObject({
      status: 'PUBLISHED',
      moderationStatus: 'PENDING',
    });

    const closed = await session.agent
      .post(`/api/v1/recruiter/jobs/${jobId}/close`)
      .set('Origin', integrationOrigin)
      .set('x-csrf-token', session.csrfToken)
      .expect(200);
    expect(closed.body.data.status).toBe('CLOSED');

    const reopened = await session.agent
      .post(`/api/v1/recruiter/jobs/${jobId}/reopen`)
      .set('Origin', integrationOrigin)
      .set('x-csrf-token', session.csrfToken)
      .expect(200);
    expect(reopened.body.data.status).toBe('PUBLISHED');

    const archived = await session.agent
      .delete(`/api/v1/recruiter/jobs/${jobId}`)
      .set('Origin', integrationOrigin)
      .set('x-csrf-token', session.csrfToken)
      .expect(200);
    expect(archived.body.data.status).toBe('ARCHIVED');
  });

  it('rejects incomplete publication and cross-company reads and edits', async () => {
    const owner = await loginUser(recruiter.email);
    const draft = await owner.agent
      .post('/api/v1/recruiter/jobs')
      .set('Origin', integrationOrigin)
      .set('x-csrf-token', owner.csrfToken)
      .send({ title: 'Incomplete role' })
      .expect(201);
    await owner.agent
      .post(`/api/v1/recruiter/jobs/${draft.body.data.id}/publish`)
      .set('Origin', integrationOrigin)
      .set('x-csrf-token', owner.csrfToken)
      .expect(422);

    const outsider = await loginUser(otherRecruiter.email);
    await outsider.agent
      .get(`/api/v1/recruiter/jobs/${draft.body.data.id}`)
      .expect(404);
    await outsider.agent
      .patch(`/api/v1/recruiter/jobs/${draft.body.data.id}`)
      .set('Origin', integrationOrigin)
      .set('x-csrf-token', outsider.csrfToken)
      .send({ title: 'Unauthorized edit' })
      .expect(404);
  });
});
