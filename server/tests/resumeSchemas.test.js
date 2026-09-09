import { describe, expect, it } from 'vitest';
import { resumeParamsSchema } from '../src/modules/resumes/resume.schemas.js';

describe('resume route schemas', () => {
  it('accepts bounded résumé identifiers', () => {
    expect(resumeParamsSchema.parse({ resumeId: 'resume-1' })).toEqual({ resumeId: 'resume-1' });
  });

  it('rejects missing and oversized identifiers', () => {
    expect(resumeParamsSchema.safeParse({ resumeId: '' }).success).toBe(false);
    expect(resumeParamsSchema.safeParse({ resumeId: 'x'.repeat(129) }).success).toBe(false);
  });
});
