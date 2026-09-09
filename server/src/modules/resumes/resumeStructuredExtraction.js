const skillDictionary = [
  'Angular', 'AWS', 'Azure', 'C', 'C++', 'C#', 'CSS', 'Django', 'Docker', 'Express',
  'Figma', 'Flask', 'Git', 'Go', 'GraphQL', 'HTML', 'Java', 'JavaScript', 'Kotlin',
  'Kubernetes', 'MongoDB', 'MySQL', 'Next.js', 'Node.js', 'PostgreSQL', 'Python',
  'React', 'Redis', 'Ruby', 'Rust', 'Spring Boot', 'SQL', 'Swift', 'Tailwind CSS',
  'TypeScript', 'Vue.js',
];

function escapePattern(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractSkills(text) {
  return skillDictionary.filter((skill) => new RegExp(
    `(^|[^a-z0-9+#])${escapePattern(skill)}(?=$|[^a-z0-9+#])`,
    'i',
  ).test(text));
}

function sectionEvidence(text, headingPattern) {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const headingIndex = lines.findIndex((line) => headingPattern.test(line));
  if (headingIndex < 0) return [];
  return lines.slice(headingIndex + 1, headingIndex + 7).map((sourceText) => ({
    sourceText,
    confidence: 'medium',
  }));
}

export function extractStructuredResumeData(text) {
  const email = text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0] || null;
  const phone = text.match(/(?:\+?\d[\d ()-]{7,}\d)/)?.[0]?.trim() || null;

  return {
    skills: extractSkills(text).map((name) => ({ name, confidence: 'high' })),
    educationEvidence: sectionEvidence(text, /^(education|academic background)$/i),
    experienceEvidence: sectionEvidence(text, /^(experience|work experience|employment)$/i),
    projectEvidence: sectionEvidence(text, /^(projects|personal projects|academic projects)$/i),
    contactSuggestions: { email, phone },
    reviewRequired: true,
  };
}
