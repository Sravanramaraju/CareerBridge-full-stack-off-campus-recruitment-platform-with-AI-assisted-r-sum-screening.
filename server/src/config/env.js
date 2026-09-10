import 'dotenv/config';
import { z } from 'zod';

const DEVELOPMENT_OUTBOX_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

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
  AUTH_RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().min(1).max(60).default(15),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(1_000).default(20),
  PASSWORD_RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(1_000).default(10),
  SMTP_HOST: z.string().min(1).default('localhost'),
  SMTP_PORT: z.coerce.number().int().min(1).max(65_535).default(1025),
  SMTP_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  SMTP_FROM: z.string().min(3).default('CareerBridge <no-reply@careerbridge.local>'),
  EMAIL_WORKER_INTERVAL_MS: z.coerce.number().int().min(1_000).max(300_000).default(10_000),
  OUTBOX_ENCRYPTION_KEY: z.string().regex(/^[a-fA-F0-9]{64}$/),
  EMBEDDINGS_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
  EMBEDDING_MODEL: z.string().min(3).default('Xenova/all-MiniLM-L6-v2'),
  MODEL_CACHE_DIR: z.string().min(1).default('./.cache/models'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
}).superRefine((values, context) => {
  if (values.NODE_ENV === 'production' && values.OUTBOX_ENCRYPTION_KEY === DEVELOPMENT_OUTBOX_KEY) {
    context.addIssue({
      code: 'custom',
      path: ['OUTBOX_ENCRYPTION_KEY'],
      message: 'Production must use a unique outbox encryption key',
    });
  }
});

const parsed = environmentSchema.safeParse(process.env);

if (!parsed.success) {
  const fields = Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join('.'), issue.message]));
  throw new Error(`Invalid server environment: ${JSON.stringify(fields)}`);
}

export const env = Object.freeze(parsed.data);
