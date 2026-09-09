import { describe, expect, it } from 'vitest';
import { extractStructuredResumeData } from '../src/modules/resumes/resumeStructuredExtraction.js';

describe('structured résumé extraction', () => {
  it('finds normalized skills without substring false positives', () => {
    const result = extractStructuredResumeData(
      'Frontend engineer using React, TypeScript, Node.js, PostgreSQL and Docker.',
    );

    expect(result.skills.map(({ name }) => name)).toEqual([
      'Docker', 'Node.js', 'PostgreSQL', 'React', 'TypeScript',
    ]);
    expect(extractStructuredResumeData('Enjoys reacting quickly.').skills).toEqual([]);
  });

  it('captures reviewable evidence beneath common section headings', () => {
    const result = extractStructuredResumeData(`
      EDUCATION
      B.E. Computer Science, Example University, 2026
      EXPERIENCE
      Software intern at Northstar Labs
      PROJECTS
      CareerBridge recruitment platform
    `);

    expect(result.educationEvidence[0]).toMatchObject({ confidence: 'medium' });
    expect(result.experienceEvidence[0].sourceText).toContain('Software intern');
    expect(result.projectEvidence[0].sourceText).toContain('CareerBridge');
    expect(result.reviewRequired).toBe(true);
  });

  it('suggests contact fields without marking them as verified', () => {
    const result = extractStructuredResumeData(
      'Ananya Rao | ananya@example.com | +91 98765 43210',
    );

    expect(result.contactSuggestions).toEqual({
      email: 'ananya@example.com',
      phone: '+91 98765 43210',
    });
    expect(result).not.toHaveProperty('verified');
  });
});
