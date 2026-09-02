import { describe, expect, it } from 'vitest';
import { readJobFacets, writeJobFacets } from '@/src/lib/jobFilterParams';

describe('job filter URL state', () => {
  it('reads repeated facets and date from search parameters', () => {
    const facets = readJobFacets(new URLSearchParams('types=Full-time&types=Internship&modes=Remote&datePosted=7'));

    expect(facets.types).toEqual(['Full-time', 'Internship']);
    expect(facets.modes).toEqual(['Remote']);
    expect(facets.datePosted).toBe('7');
  });

  it('updates facets without losing keyword or sort state', () => {
    const initial = new URLSearchParams('q=frontend&sort=match&types=Internship');
    const facets = readJobFacets(initial);
    const next = writeJobFacets(initial, { ...facets, types: ['Full-time'], modes: ['Hybrid'] });

    expect(next.get('q')).toBe('frontend');
    expect(next.get('sort')).toBe('match');
    expect(next.getAll('types')).toEqual(['Full-time']);
    expect(next.getAll('modes')).toEqual(['Hybrid']);
  });
});
