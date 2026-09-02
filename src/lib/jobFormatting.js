const DAY_IN_MS = 86400000;

export function formatPostedDate(date, now = Date.now()) {
  const dayCount = Math.max(0, Math.floor((now - new Date(date).getTime()) / DAY_IN_MS));
  if (dayCount === 0) return 'Posted today';
  if (dayCount === 1) return 'Posted yesterday';
  return `Posted ${dayCount}d ago`;
}

export function formatExperience(experience) {
  if (!experience || experience === 'Fresher') return 'Fresher';
  return experience.replace(' years', ' yrs').replace(' year', ' yr');
}

export function formatSalary(salary) {
  return salary?.trim() || 'Not disclosed';
}
