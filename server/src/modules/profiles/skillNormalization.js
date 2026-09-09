export function canonicalizeSkillName(name) {
  return name.trim().replace(/\s+/g, ' ');
}

export function normalizeSkillName(name) {
  return canonicalizeSkillName(name).toLocaleLowerCase('en-US');
}
