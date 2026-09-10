import { AppError } from '../../lib/appError.js';

export const RECRUITER_APPLICATION_TRANSITIONS = Object.freeze({
  APPLIED: Object.freeze(['UNDER_REVIEW', 'REJECTED']),
  UNDER_REVIEW: Object.freeze(['SHORTLISTED', 'REJECTED']),
  SHORTLISTED: Object.freeze(['UNDER_REVIEW', 'INTERVIEW', 'REJECTED']),
  INTERVIEW: Object.freeze(['SHORTLISTED', 'OFFERED', 'REJECTED']),
  OFFERED: Object.freeze(['INTERVIEW']),
  REJECTED: Object.freeze([]),
  WITHDRAWN: Object.freeze([]),
});

export const APPLICANT_APPLICATION_TRANSITIONS = Object.freeze({
  APPLIED: Object.freeze(['WITHDRAWN']),
  UNDER_REVIEW: Object.freeze(['WITHDRAWN']),
  SHORTLISTED: Object.freeze(['WITHDRAWN']),
  INTERVIEW: Object.freeze(['WITHDRAWN']),
  OFFERED: Object.freeze([]),
  REJECTED: Object.freeze([]),
  WITHDRAWN: Object.freeze([]),
});

export function assertApplicationStatusTransition(currentStatus, nextStatus, actorRole) {
  if (currentStatus === nextStatus) return false;
  const transitions = actorRole === 'APPLICANT'
    ? APPLICANT_APPLICATION_TRANSITIONS
    : RECRUITER_APPLICATION_TRANSITIONS;
  if (!transitions[currentStatus]?.includes(nextStatus)) {
    throw new AppError({
      code: 'INVALID_APPLICATION_TRANSITION',
      message: `An application cannot move from ${currentStatus} to ${nextStatus}.`,
      status: 409,
    });
  }
  return true;
}
