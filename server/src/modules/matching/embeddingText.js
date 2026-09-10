import { createHash } from 'node:crypto';

export function normalizeEmbeddingText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function sortedSkills(job, requirement) {
  return (job.skills ?? [])
    .filter((entry) => entry.requirement === requirement)
    .map(({ skill }) => normalizeEmbeddingText(skill.name))
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right, 'en'));
}

export function buildJobEmbeddingText(job) {
  const sections = [
    ['Title', job.title],
    ['Summary', job.summary],
    ['Description', job.description],
    ['Required skills', sortedSkills(job, 'REQUIRED').join(', ')],
    ['Preferred skills', sortedSkills(job, 'PREFERRED').join(', ')],
    ['Responsibilities', (job.responsibilities ?? []).map(normalizeEmbeddingText).join('; ')],
    ['Qualifications', job.qualification],
  ];
  return sections
    .map(([label, value]) => [label, normalizeEmbeddingText(value)])
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');
}

export function buildResumeEmbeddingText(extractedText) {
  return normalizeEmbeddingText(extractedText);
}

export function embeddingContentHash(text) {
  return createHash('sha256').update(normalizeEmbeddingText(text), 'utf8').digest('hex');
}
