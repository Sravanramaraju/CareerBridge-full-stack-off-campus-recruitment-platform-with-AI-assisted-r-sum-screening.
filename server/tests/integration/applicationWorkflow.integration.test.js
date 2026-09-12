import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { disconnectDatabase } from '../../src/lib/database.js';
import {
  closeIntegrationDatabase,
  integrationDatabase,
  resetIntegrationDatabase,
} from './database.js';
import {
  createCompany,
  createJob,
  createResume,
  createUser,
  integrationOrigin,
  loginUser,
} from './fixtures.js';

let applicantA;
let applicantB;
let recruiterA;
let recruiterB;
let job;
let resumeA;

describe('application workflow with PostgreSQL', () => {
  beforeEach(async () => {
    await resetIntegrationDatabase();
    [applicantA, applicantB, recruiterA, recruiterB] = await Promise.all([
      createUser({
        id: 'applicant-a',
        email: 'applicant-a@example.com',
        name: 'Applicant A',
      }),
      createUser({
        id: 'applicant-b',
        email: 'applicant-b@example.com',
        name: 'Applicant B',
      }),
      createUser({
        id: 'recruiter-a',
        email: 'recruiter-a@example.com',
        name: 'Recruiter A',
        role: 'RECRUITER',
      }),
      createUser({
        id: 'recruiter-b',
        email: 'recruiter-b@example.com',
        name: 'Recruiter B',
        role: 'RECRUITER',
      }),
    ]);
    const companyA = await createCompany({
      id: 'company-a',
      ownerId: recruiterA.id,
    });
    await createCompany({ id: 'company-b', ownerId: recruiterB.id });
    job = await createJob({
      id: 'job-a',
      companyId: companyA.id,
      recruiterId: recruiterA.id,
    });
    resumeA = await createResume({
      id: 'resume-a',
      applicantProfileId: applicantA.applicantProfile.id,
    });
    await createResume({
      id: 'resume-b',
      applicantProfileId: applicantB.applicantProfile.id,
      suffix: '2',
    });
  });

  afterAll(async () => {
    await Promise.all([disconnectDatabase(), closeIntegrationDatabase()]);
  });

  async function submitApplication() {
    const applicantSession = await loginUser(applicantA.email);
    const response = await applicantSession.agent
      .post(`/api/v1/jobs/${job.id}/applications`)
      .set('Origin', integrationOrigin)
      .set('x-csrf-token', applicantSession.csrfToken)
      .send({
        resumeId: resumeA.id,
        coverNote: 'Relevant integration evidence.',
        screeningAnswers: [],
      })
      .expect(201);
    return { applicantSession, applicationId: response.body.data.id };
  }

  it('submits once, creates initial history and notifications, and rejects duplicates', async () => {
    const { applicantSession, applicationId } = await submitApplication();
    const application = await integrationDatabase.application.findUnique({
      where: { id: applicationId },
      include: { statusHistory: true, match: true },
    });
    expect(application.status).toBe('APPLIED');
    expect(application.statusHistory).toHaveLength(1);
    expect(application.statusHistory[0].newStatus).toBe('APPLIED');
    expect(application.match.overallScore).toBeGreaterThanOrEqual(0);
    expect(application.match.overallScore).toBeLessThanOrEqual(100);
    expect(await integrationDatabase.notification.count()).toBe(2);

    const duplicate = await applicantSession.agent
      .post(`/api/v1/jobs/${job.id}/applications`)
      .set('Origin', integrationOrigin)
      .set('x-csrf-token', applicantSession.csrfToken)
      .send({ resumeId: resumeA.id, screeningAnswers: [] })
      .expect(409);
    expect(duplicate.body.error.code).toBe('APPLICATION_EXISTS');
  });

  it('rejects a foreign resume and jobs that are closed, moderated, or expired', async () => {
    const applicantBSession = await loginUser(applicantB.email);
    await applicantBSession.agent
      .post(`/api/v1/jobs/${job.id}/applications`)
      .set('Origin', integrationOrigin)
      .set('x-csrf-token', applicantBSession.csrfToken)
      .send({ resumeId: resumeA.id, screeningAnswers: [] })
      .expect(404);

    const unavailableStates = [
      { id: 'closed-job', status: 'CLOSED' },
      { id: 'flagged-job', moderationStatus: 'FLAGGED' },
      { id: 'expired-job', deadline: new Date(Date.now() - 86_400_000) },
    ];
    for (const state of unavailableStates) {
      const unavailable = await createJob({
        ...state,
        companyId: 'company-a',
        recruiterId: recruiterA.id,
      });
      await applicantBSession.agent
        .post(`/api/v1/jobs/${unavailable.id}/applications`)
        .set('Origin', integrationOrigin)
        .set('x-csrf-token', applicantBSession.csrfToken)
        .send({ resumeId: 'resume-b', screeningAnswers: [] })
        .expect(404);
    }
  });

  it('enforces recruiter and applicant ownership without exposing private notes', async () => {
    const { applicantSession, applicationId } = await submitApplication();
    const [ownerSession, foreignRecruiterSession, otherApplicantSession] =
      await Promise.all([
        loginUser(recruiterA.email),
        loginUser(recruiterB.email),
        loginUser(applicantB.email),
      ]);

    await ownerSession.agent
      .get(`/api/v1/recruiter/applications/${applicationId}`)
      .expect(200);
    await foreignRecruiterSession.agent
      .get(`/api/v1/recruiter/applications/${applicationId}`)
      .expect(404);
    await otherApplicantSession.agent
      .get(`/api/v1/applicant/applications/${applicationId}`)
      .expect(404);

    const note = await ownerSession.agent
      .post(`/api/v1/recruiter/applications/${applicationId}/notes`)
      .set('Origin', integrationOrigin)
      .set('x-csrf-token', ownerSession.csrfToken)
      .send({ body: 'Private recruiter evidence note.' })
      .expect(201);
    expect(note.body.data.note).toContain('Private recruiter');

    const applicantView = await applicantSession.agent
      .get(`/api/v1/applicant/applications/${applicationId}`)
      .expect(200);
    expect(JSON.stringify(applicantView.body)).not.toContain(
      'Private recruiter',
    );
    expect(applicantView.body.data).not.toHaveProperty('recruiterNotes');
  });

  it('synchronizes recruiter status updates to the applicant and rejects invalid transitions', async () => {
    const { applicantSession, applicationId } = await submitApplication();
    const recruiterSession = await loginUser(recruiterA.email);

    const updated = await recruiterSession.agent
      .patch(`/api/v1/recruiter/applications/${applicationId}/status`)
      .set('Origin', integrationOrigin)
      .set('x-csrf-token', recruiterSession.csrfToken)
      .send({ status: 'UNDER_REVIEW', reason: 'Evidence review started.' })
      .expect(200);
    expect(updated.body.data.statusCode).toBe('UNDER_REVIEW');

    const applicantView = await applicantSession.agent
      .get(`/api/v1/applicant/applications/${applicationId}`)
      .expect(200);
    expect(applicantView.body.data.statusCode).toBe('UNDER_REVIEW');
    expect(applicantView.body.data.history.at(-1)).toMatchObject({
      newStatus: 'UNDER_REVIEW',
      reason: 'Evidence review started.',
    });

    const invalid = await recruiterSession.agent
      .patch(`/api/v1/recruiter/applications/${applicationId}/status`)
      .set('Origin', integrationOrigin)
      .set('x-csrf-token', recruiterSession.csrfToken)
      .send({ status: 'OFFERED' })
      .expect(409);
    expect(invalid.body.error.code).toBe('INVALID_APPLICATION_TRANSITION');
  });
});
