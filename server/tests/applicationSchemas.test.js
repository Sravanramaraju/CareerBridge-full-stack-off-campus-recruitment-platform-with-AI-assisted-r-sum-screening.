import { describe, expect, it } from 'vitest';
import {
  applicationCreateSchema,
  applicationParamsSchema,
  applicationStatusUpdateSchema,
  recruiterNoteCreateSchema,
  recruiterNoteParamsSchema,
  recruiterApplicationListQuerySchema,
} from '../src/modules/applications/application.schemas.js';

describe('application schemas', () => {
  it('normalizes optional cover notes and screening answers', () => {
    expect(applicationCreateSchema.parse({
      resumeId: 'resume-1',
      coverNote: '  Excited to contribute.  ',
      screeningAnswers: [{ questionId: 'question-1', answer: '  Yes  ' }],
    })).toEqual({
      resumeId: 'resume-1',
      coverNote: 'Excited to contribute.',
      screeningAnswers: [{ questionId: 'question-1', answer: 'Yes' }],
    });
  });

  it('defaults missing screening answers to an empty collection', () => {
    expect(applicationCreateSchema.parse({ resumeId: 'resume-1' }))
      .toEqual({ resumeId: 'resume-1', screeningAnswers: [] });
  });

  it('rejects duplicate screening answers', () => {
    const result = applicationCreateSchema.safeParse({
      resumeId: 'resume-1',
      screeningAnswers: [
        { questionId: 'question-1', answer: 'First' },
        { questionId: 'question-1', answer: 'Second' },
      ],
    });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toEqual(['screeningAnswers', 1, 'questionId']);
  });

  it('limits cover-note and answer payload sizes', () => {
    expect(applicationCreateSchema.safeParse({
      resumeId: 'resume-1',
      coverNote: 'x'.repeat(501),
    }).success).toBe(false);
    expect(applicationCreateSchema.safeParse({
      resumeId: 'resume-1',
      screeningAnswers: [{ questionId: 'question-1', answer: 'x'.repeat(1_001) }],
    }).success).toBe(false);
  });

  it('validates application route identifiers', () => {
    expect(applicationParamsSchema.parse({ applicationId: 'application-1' }))
      .toEqual({ applicationId: 'application-1' });
    expect(applicationParamsSchema.safeParse({ applicationId: '' }).success).toBe(false);
  });

  it('coerces bounded recruiter pipeline filters', () => {
    expect(recruiterApplicationListQuerySchema.parse({
      status: 'SHORTLISTED',
      minMatch: '80',
      minExperienceMonths: '12',
      page: '2',
    })).toMatchObject({
      status: 'SHORTLISTED',
      minMatch: 80,
      minExperienceMonths: 12,
      page: 2,
      pageSize: 20,
    });
  });

  it('validates recruiter status update payloads', () => {
    expect(applicationStatusUpdateSchema.parse({
      status: 'INTERVIEW', reason: 'Technical interview scheduled.',
    })).toEqual({ status: 'INTERVIEW', reason: 'Technical interview scheduled.' });
    expect(applicationStatusUpdateSchema.safeParse({ status: 'APPLIED' }).success).toBe(false);
    expect(applicationStatusUpdateSchema.safeParse({ status: 'UNKNOWN' }).success).toBe(false);
  });

  it('validates and trims private recruiter notes', () => {
    expect(recruiterNoteCreateSchema.parse({ body: '  Strong portfolio evidence.  ' }))
      .toEqual({ body: 'Strong portfolio evidence.' });
    expect(recruiterNoteCreateSchema.safeParse({ body: ' ' }).success).toBe(false);
    expect(recruiterNoteCreateSchema.safeParse({ body: 'x'.repeat(2_001) }).success).toBe(false);
    expect(recruiterNoteParamsSchema.parse({ noteId: 'note-1' })).toEqual({ noteId: 'note-1' });
  });
});
