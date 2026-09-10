import { notFoundError } from '../../lib/appError.js';
import { findPublicJobByIdentifier } from '../jobs/job.repository.js';
import { toPublicJob } from '../jobs/job.presenter.js';
import { findApplicantProfileByUserId } from '../profiles/profile.repository.js';
import { findPreferredOwnedResume } from '../resumes/resume.repository.js';
import { calculateHybridMatch } from './hybridMatch.service.js';
import { getSemanticSimilarityScore } from './semanticEmbedding.service.js';

export async function getApplicantJobMatch(
  applicantId,
  jobIdentifier,
  {
    findJob = findPublicJobByIdentifier,
    findProfile = findApplicantProfileByUserId,
    findResume = findPreferredOwnedResume,
    getSemanticScore = getSemanticSimilarityScore,
    calculateMatch = calculateHybridMatch,
    presentJob = toPublicJob,
    now = () => new Date(),
  } = {},
) {
  const generatedAt = now();
  const [job, profile, resume] = await Promise.all([
    findJob(jobIdentifier, generatedAt),
    findProfile(applicantId),
    findResume(applicantId),
  ]);
  if (!job) throw notFoundError('The requested job is not available.');
  if (!profile) throw notFoundError('The applicant profile was not found.');

  const semanticScore = resume
    ? await getSemanticScore(job, resume)
    : null;
  return {
    job: presentJob(job),
    match: calculateMatch(job, profile, { semanticScore, now: generatedAt }),
    resume: resume ? {
      id: resume.id,
      originalFileName: resume.originalFileName,
      parseStatus: resume.parseStatus,
    } : null,
    generatedAt,
  };
}
