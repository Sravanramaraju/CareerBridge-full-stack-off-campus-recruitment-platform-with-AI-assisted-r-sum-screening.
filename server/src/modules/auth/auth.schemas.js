import { z } from 'zod';

export const normalizedEmailSchema = z
  .string()
  .trim()
  .max(254)
  .pipe(z.email())
  .transform((email) => email.toLowerCase());

export const passwordSchema = z.string().min(8).max(128);

export const loginSchema = z.object({
  email: normalizedEmailSchema,
  password: z.string().min(1).max(128),
  rememberMe: z.boolean().default(false),
});
