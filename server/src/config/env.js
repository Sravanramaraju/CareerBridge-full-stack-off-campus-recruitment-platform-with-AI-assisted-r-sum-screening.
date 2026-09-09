import 'dotenv/config';
import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z
    .url()
    .refine((value) => value.startsWith('postgresql://') || value.startsWith('postgres://'), {
      message: 'DATABASE_URL must use the PostgreSQL protocol',
    }),
  DATABASE_URL_TEST: z
    .url()
    .refine((value) => value.startsWith('postgresql://') || value.startsWith('postgres://'), {
      message: 'DATABASE_URL_TEST must use the PostgreSQL protocol',
    })
    .optional(),
  CLIENT_ORIGIN: z.url().default('http://localhost:5173'),
  SESSION_COOKIE_NAME: z.string().regex(/^[A-Za-z0-9_-]+$/).default('careerbridge_session'),
  CSRF_COOKIE_NAME: z.string().regex(/^[A-Za-z0-9_-]+$/).default('careerbridge_csrf'),
  SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(168).default(24),
  REMEMBER_ME_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(30),
  PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().min(5).max(120).default(30),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

const parsed = environmentSchema.safeParse(process.env);

if (!parsed.success) {
  const fields = Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join('.'), issue.message]));
  throw new Error(`Invalid server environment: ${JSON.stringify(fields)}`);
}

export const env = Object.freeze(parsed.data);
