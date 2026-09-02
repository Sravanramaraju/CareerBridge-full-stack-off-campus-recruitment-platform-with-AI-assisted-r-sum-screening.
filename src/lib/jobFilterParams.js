export const JOB_FACET_KEYS = ['types', 'modes', 'salaryBands', 'industries', 'skills', 'experiences', 'locations', 'companyTypes'];

export function readJobFacets(searchParams) {
  return {
    ...Object.fromEntries(JOB_FACET_KEYS.map((key) => [key, searchParams.getAll(key)])),
    datePosted: searchParams.get('datePosted') || '',
  };
}

export function writeJobFacets(searchParams, facets) {
  const next = new URLSearchParams(searchParams);
  JOB_FACET_KEYS.forEach((key) => {
    next.delete(key);
    facets[key].forEach((value) => next.append(key, value));
  });
  if (facets.datePosted) next.set('datePosted', facets.datePosted);
  else next.delete('datePosted');
  return next;
}
