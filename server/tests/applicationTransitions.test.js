import { describe, expect, it } from 'vitest';
import {
  APPLICANT_APPLICATION_TRANSITIONS,
  assertApplicationStatusTransition,
  RECRUITER_APPLICATION_TRANSITIONS,
} from '../src/modules/applications/applicationTransitions.js';

describe('application status transitions', () => {
  it('supports the forward recruiter hiring workflow and explicit rejection', () => {
    expect(RECRUITER_APPLICATION_TRANSITIONS.APPLIED).toEqual(['UNDER_REVIEW', 'REJECTED']);
    expect(() => assertApplicationStatusTransition('SHORTLISTED', 'INTERVIEW', 'RECRUITER'))
      .not.toThrow();
    expect(() => assertApplicationStatusTransition('INTERVIEW', 'REJECTED', 'RECRUITER'))
      .not.toThrow();
  });

  it('permits only limited one-stage recruiter corrections', () => {
    expect(() => assertApplicationStatusTransition('INTERVIEW', 'SHORTLISTED', 'RECRUITER'))
      .not.toThrow();
    expect(() => assertApplicationStatusTransition('OFFERED', 'APPLIED', 'RECRUITER'))
      .toThrow(expect.objectContaining({ code: 'INVALID_APPLICATION_TRANSITION', status: 409 }));
  });

  it('keeps rejected and withdrawn applications final', () => {
    expect(RECRUITER_APPLICATION_TRANSITIONS.REJECTED).toEqual([]);
    expect(APPLICANT_APPLICATION_TRANSITIONS.WITHDRAWN).toEqual([]);
    expect(() => assertApplicationStatusTransition('REJECTED', 'UNDER_REVIEW', 'RECRUITER'))
      .toThrow(expect.objectContaining({ code: 'INVALID_APPLICATION_TRANSITION' }));
  });

  it('allows applicants to withdraw only before a final outcome', () => {
    expect(() => assertApplicationStatusTransition('UNDER_REVIEW', 'WITHDRAWN', 'APPLICANT'))
      .not.toThrow();
    expect(() => assertApplicationStatusTransition('OFFERED', 'WITHDRAWN', 'APPLICANT'))
      .toThrow(expect.objectContaining({ code: 'INVALID_APPLICATION_TRANSITION' }));
  });

  it('identifies repeated requests without creating duplicate history', () => {
    expect(assertApplicationStatusTransition('INTERVIEW', 'INTERVIEW', 'RECRUITER')).toBe(false);
  });
});
