import { describe, expect, it } from 'vitest';
import {
  canonicalizeSkillName,
  normalizeSkillName,
} from '../src/modules/profiles/skillNormalization.js';

describe('skill name normalization', () => {
  it('uses a stable canonical display form', () => {
    expect(canonicalizeSkillName('  Node.js   and   Express  ')).toBe('Node.js and Express');
  });

  it('creates a case-insensitive uniqueness key', () => {
    expect(normalizeSkillName('  React  ')).toBe('react');
    expect(normalizeSkillName('REACT')).toBe('react');
  });
});
