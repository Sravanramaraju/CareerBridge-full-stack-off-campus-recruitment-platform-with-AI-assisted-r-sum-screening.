import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import { disconnectDatabase } from '../../src/lib/database.js';
import { localStorageService } from '../../src/modules/resumes/localStorage.service.js';
import {
  closeIntegrationDatabase,
  integrationDatabase,
  resetIntegrationDatabase,
} from './database.js';
import {
  createCompany,
  createJob,
  createUser,
  integrationOrigin,
  loginUser,
} from './fixtures.js';

const storedKeys = new Set();
let applicant;
let otherApplicant;
let recruiter;
let otherRecruiter;
let job;

function tinyPdf() {
  const stream =
    'BT /F1 12 Tf 72 720 Td (CareerBridge integration resume) Tj ET';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let value = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(value));
    value += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(value);
  value += `xref\n0 6\n0000000000 65535 f \n${offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(value);
}

describe('resume storage and authorization with PostgreSQL', () => {
  beforeEach(async () => {
    await resetIntegrationDatabase();
    [applicant, otherApplicant, recruiter, otherRecruiter] = await Promise.all([
      createUser({
        id: 'resume-applicant',
        email: 'resume-applicant@example.com',
        name: 'Resume Applicant',
      }),
      createUser({
        id: 'other-applicant',
        email: 'other-applicant@example.com',
        name: 'Other Applicant',
      }),
      createUser({
        id: 'resume-recruiter',
        email: 'resume-recruiter@example.com',
        name: 'Resume Recruiter',
        role: 'RECRUITER',
      }),
      createUser({
        id: 'other-recruiter',
        email: 'other-recruiter@example.com',
        name: 'Other Recruiter',
        role: 'RECRUITER',
      }),
    ]);
    const company = await createCompany({
      id: 'resume-company',
      ownerId: recruiter.id,
    });
    await createCompany({
      id: 'other-resume-company',
      ownerId: otherRecruiter.id,
    });
    job = await createJob({
      id: 'resume-job',
      companyId: company.id,
      recruiterId: recruiter.id,
    });
  });

  afterEach(async () => {
    await Promise.all(
      [...storedKeys].map((key) => localStorageService.delete(key)),
    );
    storedKeys.clear();
  });

  afterAll(async () => {
    await Promise.all([disconnectDatabase(), closeIntegrationDatabase()]);
  });

  async function uploadResume() {
    const session = await loginUser(applicant.email);
    const response = await session.agent
      .post('/api/v1/applicant/resumes')
      .set('Origin', integrationOrigin)
      .set('x-csrf-token', session.csrfToken)
      .attach('resume', tinyPdf(), {
        filename: 'integration-resume.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);
    const record = await integrationDatabase.resume.findUniqueOrThrow({
      where: { id: response.body.data.id },
    });
    storedKeys.add(record.storageKey);
    return { session, record };
  }

  it('stores a signature-validated PDF and streams it only to its applicant owner', async () => {
    const { session, record } = await uploadResume();
    expect(record.storageProvider).toBe('LOCAL');
    expect(record.mimeType).toBe('application/pdf');
    expect(record.fileSize).toBeGreaterThan(100);

    const content = await session.agent
      .get(`/api/v1/resumes/${record.id}/content`)
      .buffer(true)
      .expect('Content-Type', /application\/pdf/)
      .expect(200);
    expect(content.body.subarray(0, 4).toString()).toBe('%PDF');

    const otherSession = await loginUser(otherApplicant.email);
    await otherSession.agent
      .get(`/api/v1/resumes/${record.id}/content`)
      .expect(404);
  });

  it('allows the owning recruiter after application and denies an unrelated recruiter', async () => {
    const { record } = await uploadResume();
    await integrationDatabase.application.create({
      data: {
        id: 'resume-application',
        applicantId: applicant.id,
        jobId: job.id,
        resumeId: record.id,
        statusHistory: {
          create: { newStatus: 'APPLIED', changedByUserId: applicant.id },
        },
      },
    });
    const [ownerSession, unrelatedSession] = await Promise.all([
      loginUser(recruiter.email),
      loginUser(otherRecruiter.email),
    ]);
    await ownerSession.agent
      .get(`/api/v1/resumes/${record.id}/content`)
      .expect(200);
    await unrelatedSession.agent
      .get(`/api/v1/resumes/${record.id}/content`)
      .expect(404);
  });

  it('soft-deletes unused uploads and excludes them from applicant access and listings', async () => {
    const { session, record } = await uploadResume();
    await session.agent
      .delete(`/api/v1/applicant/resumes/${record.id}`)
      .set('Origin', integrationOrigin)
      .set('x-csrf-token', session.csrfToken)
      .expect(200);

    const deleted = await integrationDatabase.resume.findUniqueOrThrow({
      where: { id: record.id },
    });
    expect(deleted.deletedAt).toBeInstanceOf(Date);
    await session.agent.get(`/api/v1/resumes/${record.id}/content`).expect(404);
    const list = await session.agent
      .get('/api/v1/applicant/resumes')
      .expect(200);
    expect(list.body.data).toEqual([]);
  });

  it('rejects unsupported content even when the filename claims to be a PDF', async () => {
    const session = await loginUser(applicant.email);
    const response = await session.agent
      .post('/api/v1/applicant/resumes')
      .set('Origin', integrationOrigin)
      .set('x-csrf-token', session.csrfToken)
      .attach('resume', Buffer.from('not a PDF'), {
        filename: 'unsafe.pdf',
        contentType: 'application/pdf',
      })
      .expect(422);
    expect(response.body.error.code).toBe('INVALID_RESUME_FILE');
    expect(await integrationDatabase.resume.count()).toBe(0);
  });
});
