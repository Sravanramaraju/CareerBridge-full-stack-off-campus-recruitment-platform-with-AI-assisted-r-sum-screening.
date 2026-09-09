import { prisma } from '../../lib/database.js';

export function upsertSkillRecord({ name, normalizedName }, database = prisma) {
  return database.skill.upsert({
    where: { normalizedName },
    create: { name, normalizedName },
    update: {},
    select: { id: true, name: true, normalizedName: true },
  });
}
