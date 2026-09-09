const EMPLOYMENT_TYPES = {
  'Full-time': 'FULL_TIME',
  'Part-time': 'PART_TIME',
  Internship: 'INTERNSHIP',
  Contract: 'CONTRACT',
};

const WORK_MODES = {
  'On-site': 'ON_SITE',
  Hybrid: 'HYBRID',
  Remote: 'REMOTE',
};

const EXPERIENCE_RANGES = {
  Fresher: [0, 0],
  '0–1 years': [0, 1],
  '1–2 years': [1, 2],
  '2–3 years': [2, 3],
};

const SALARY_BANDS = {
  'Up to ₹5 LPA': { salaryMin: { lte: 500_000 } },
  '₹5–8 LPA': { salaryMin: { lte: 800_000 }, salaryMax: { gte: 500_000 } },
  '₹8+ LPA': { salaryMax: { gte: 800_000 } },
};

function textContains(value) {
  return { contains: value, mode: 'insensitive' };
}

function selectedExperience(filters) {
  return [...new Set([...(filters.experiences || []), ...(filters.experience ? [filters.experience] : [])])];
}

export function buildPublicJobQuery(filters, now = new Date(), companyIdentifier) {
  const conditions = [];
  const company = { verificationStatus: 'VERIFIED' };

  if (companyIdentifier) company.OR = [{ id: companyIdentifier }, { slug: companyIdentifier }];
  if (filters.industries?.length) company.industry = { in: filters.industries };
  if (filters.companyTypes?.length) company.companyType = { in: filters.companyTypes };

  if (filters.q) {
    conditions.push({
      OR: [
        { title: textContains(filters.q) },
        { summary: textContains(filters.q) },
        { description: textContains(filters.q) },
        { department: textContains(filters.q) },
        { location: textContains(filters.q) },
        { company: { is: { name: textContains(filters.q) } } },
        { skills: { some: { skill: { name: textContains(filters.q) } } } },
      ],
    });
  }

  const locations = [...new Set([...(filters.locations || []), ...(filters.location ? [filters.location] : [])])];
  if (locations.length) {
    conditions.push({ OR: locations.map((location) => ({ location: textContains(location) })) });
  }

  if (filters.types?.length) {
    conditions.push({ employmentType: { in: filters.types.map((type) => EMPLOYMENT_TYPES[type]) } });
  }
  if (filters.modes?.length) {
    conditions.push({ workMode: { in: filters.modes.map((mode) => WORK_MODES[mode]) } });
  }
  if (filters.skills?.length) {
    conditions.push({
      OR: filters.skills.map((skill) => ({
        skills: { some: { skill: { name: textContains(skill) } } },
      })),
    });
  }

  const experiences = selectedExperience(filters);
  if (experiences.length) {
    conditions.push({
      OR: experiences.map((experience) => {
        const [experienceMin, experienceMax] = EXPERIENCE_RANGES[experience];
        return { experienceMin, experienceMax };
      }),
    });
  }

  if (filters.salaryBands?.length) {
    conditions.push({ OR: filters.salaryBands.map((band) => SALARY_BANDS[band]) });
  }

  if (filters.datePosted) {
    const publishedAfter = new Date(now);
    publishedAfter.setUTCDate(publishedAfter.getUTCDate() - Number(filters.datePosted));
    conditions.push({ publishedAt: { gte: publishedAfter } });
  }

  const orderBy = {
    recommended: [{ featured: 'desc' }, { publishedAt: 'desc' }, { id: 'asc' }],
    newest: [{ publishedAt: 'desc' }, { id: 'asc' }],
    salary: [{ salaryMax: { sort: 'desc', nulls: 'last' } }, { publishedAt: 'desc' }, { id: 'asc' }],
  }[filters.sort];

  return {
    where: {
      status: 'PUBLISHED',
      moderationStatus: 'CLEARED',
      deadline: { gt: now },
      company: { is: company },
      ...(conditions.length ? { AND: conditions } : {}),
    },
    orderBy,
  };
}
