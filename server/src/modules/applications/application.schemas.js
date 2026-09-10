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
