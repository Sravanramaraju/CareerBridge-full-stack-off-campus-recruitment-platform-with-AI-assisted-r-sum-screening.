import 'dotenv/config';
import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  CLIENT_ORIGIN: z.url().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

const parsed = environmentSchema.safeParse(process.env);

if (!parsed.success) {
  const fields = Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join('.'), issue.message]));
  throw new Error(`Invalid server environment: ${JSON.stringify(fields)}`);
}

export const env = Object.freeze(parsed.data);
