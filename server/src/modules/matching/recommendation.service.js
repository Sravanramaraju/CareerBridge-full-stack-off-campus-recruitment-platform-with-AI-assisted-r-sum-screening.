import { notFoundError } from '../../lib/appError.js';
import { toPublicJob } from '../jobs/job.presenter.js';
import { findApplicantProfileByUserId } from '../profiles/profile.repository.js';
import { findPreferredOwnedResume } from '../resumes/resume.repository.js';
import { calculateHybridMatch } from './hybridMatch.service.js';
import { listRecommendationCandidates } from './recommendation.repository.js';
import { getStoredSemanticSimilarityScore } from './semanticEmbedding.service.js';

function newestFirst(left, right) {
  return new Date(right.job.publishedAt).getTime() - new Date(left.job.publishedAt).getTime();
}

export async function getApplicantRecommendations(
  applicantId,
  { limit = 12 } = {},
  {
    findProfile = findApplicantProfileByUserId,
    findResume = findPreferredOwnedResume,
    listCandidates = listRecommendationCandidates,
    getSemanticScore = getStoredSemanticSimilarityScore,
    calculateMatch = calculateHybridMatch,
    presentJob = toPublicJob,
    now = () => new Date(),
  } = {},
) {
  const generatedAt = now();
  const candidateLimit = Math.min(50, Math.max(20, limit * 3));
  const [profile, resume, jobs] = await Promise.all([
    findProfile(applicantId),
    findResume(applicantId),
    listCandidates(applicantId, generatedAt, candidateLimit),
  ]);
  if (!profile) throw notFoundError('The applicant profile was not found.');

  const scoredJobs = await Promise.all(jobs.map(async (job) => {
    const semanticScore = resume
      ? await getSemanticScore(job.id, resume.id)
      : null;
    return {
      job: presentJob(job),
      match: calculateMatch(job, profile, { semanticScore, now: generatedAt }),
    };
  }));

  scoredJobs.sort((left, right) => (
    right.match.overallScore - left.match.overallScore || newestFirst(left, right)
  ));
  return {
    items: scoredJobs.slice(0, limit),
    meta: {
      limit,
      candidateCount: jobs.length,
      generatedAt,
    },
  };
}
