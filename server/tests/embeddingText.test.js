import { describe, expect, it } from 'vitest';
import {
  buildJobEmbeddingText,
  buildResumeEmbeddingText,
  embeddingContentHash,
  normalizeEmbeddingText,
} from '../src/modules/matching/embeddingText.js';

describe('embedding text', () => {
  it('normalizes whitespace without changing meaningful content', () => {
    expect(normalizeEmbeddingText('  React\n\t engineer   role ')).toBe('React engineer role');
  });

  it('assembles deterministic job evidence with sorted skill groups', () => {
    const job = {
      title: 'Frontend Engineer', summary: 'Build\naccessible products.',
      description: 'Own user interfaces.', responsibilities: ['Test features', 'Ship UI'],
      qualification: 'Bachelor degree or equivalent experience',
      skills: [
        { requirement: 'REQUIRED', skill: { name: 'React' } },
        { requirement: 'PREFERRED', skill: { name: 'Docker' } },
        { requirement: 'REQUIRED', skill: { name: 'JavaScript' } },
      ],
    };
    expect(buildJobEmbeddingText(job)).toBe([
      'Title: Frontend Engineer',
      'Summary: Build accessible products.',
      'Description: Own user interfaces.',
      'Required skills: JavaScript, React',
      'Preferred skills: Docker',
      'Responsibilities: Test features; Ship UI',
      'Qualifications: Bachelor degree or equivalent experience',
    ].join('\n'));
  });

  it('normalizes resume text and produces stable SHA-256 hashes', () => {
    expect(buildResumeEmbeddingText('React\nNode.js')).toBe('React Node.js');
    expect(embeddingContentHash('React  Node.js')).toBe(embeddingContentHash('React\nNode.js'));
    expect(embeddingContentHash('React Node.js')).toMatch(/^[a-f0-9]{64}$/);
  });
});
