import { prisma } from '../../lib/database.js';

export async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'up' };
  } catch {
    return { status: 'down' };
  }
}
