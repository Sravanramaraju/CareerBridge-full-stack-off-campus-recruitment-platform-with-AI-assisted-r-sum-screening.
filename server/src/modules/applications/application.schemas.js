import { z } from 'zod';

const resourceId = z.string().trim().min(1).max(128);
const screeningAnswer = z.object({
  questionId: resourceId,
  answer: z.string().trim().min(1).max(1_000),
}).strict();

function uniqueQuestionAnswers(application, context) {
  const questionIds = new Set();
  application.screeningAnswers.forEach((answer, index) => {
    if (questionIds.has(answer.questionId)) context.addIssue({
      code: 'custom',
      message: 'Each screening question may be answered only once.',
      path: ['screeningAnswers', index, 'questionId'],
    });
    questionIds.add(answer.questionId);
  });
}

export const applicationCreateSchema = z.object({
  resumeId: resourceId,
  coverNote: z.string().trim().max(500).nullable().optional(),
  screeningAnswers: z.array(screeningAnswer).max(5).default([]),
}).strict().superRefine(uniqueQuestionAnswers);

export const applicationParamsSchema = z.object({
  applicationId: resourceId,
}).strict();

const applicationStatus = z.enum([
  'APPLIED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW',
  'OFFERED',
  'REJECTED',
  'WITHDRAWN',
]);

export const recruiterApplicationListQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  status: applicationStatus.optional(),
  minMatch: z.coerce.number().int().min(0).max(100).default(0),
  minExperienceMonths: z.coerce.number().int().min(0).max(960).optional(),
  location: z.string().trim().max(160).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
}).strict();

export const applicationStatusUpdateSchema = z.object({
  status: applicationStatus.exclude(['APPLIED']),
  reason: z.string().trim().min(2).max(500).nullable().optional(),
}).strict();
