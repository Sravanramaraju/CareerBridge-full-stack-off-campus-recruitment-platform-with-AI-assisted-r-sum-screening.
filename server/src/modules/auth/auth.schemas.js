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

const signupBaseSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: normalizedEmailSchema,
  password: passwordSchema,
  acceptedTerms: z.literal(true),
});

export const applicantSignupSchema = signupBaseSchema;

export const recruiterSignupSchema = signupBaseSchema.extend({
  companyName: z.string().trim().min(2).max(160),
});
