import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { Button, buttonVariants } from '@/src/components/ui/Button';
import { FormField, Input } from '@/src/components/ui/Input';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';
import { authService } from '@/src/services/authService';
import { useAppStore } from '@/src/store/useAppStore';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Use at least 8 characters.').max(128),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export function ResetPasswordPage() {
  useDocumentTitle('Choose a new password');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const clearSession = useAppStore((state) => state.logout);
  const [complete, setComplete] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  async function onSubmit(values) {
    if (!token) return;
    setServerError('');
    try {
      await authService.resetPassword({ token, password: values.password });
      clearSession();
      setComplete(true);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : 'This reset link could not be used. Request a new one and try again.',
      );
    }
  }

  if (complete) {
    return (
      <section className="w-full max-w-md text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--cb-emerald-soft)] text-[var(--cb-emerald)]">
          <CheckCircle2 />
        </span>
        <h1 className="mt-5 font-heading text-2xl font-extrabold">
          Password updated
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--cb-text-secondary)]">
          Your previous sessions have been signed out. Log in again with your
          new password.
        </p>
        <Link to="/login" className={`${buttonVariants()} mt-6`}>
          Return to login
        </Link>
      </section>
    );
  }

  if (!token) {
    return (
      <section className="w-full max-w-md text-center">
        <h1 className="font-heading text-2xl font-extrabold">
          Reset link unavailable
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--cb-text-secondary)]">
          This link is missing its security token. Request a fresh password
          reset email.
        </p>
        <Link to="/forgot-password" className={`${buttonVariants()} mt-6`}>
          Request a new link
        </Link>
      </section>
    );
  }

  return (
    <section className="w-full max-w-md">
      <p className="text-sm font-bold text-[var(--cb-primary)]">
        Secure account recovery
      </p>
      <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">
        Choose a new password
      </h1>
      <p className="mt-2 text-sm leading-6 text-[var(--cb-text-secondary)]">
        Use at least eight characters. Completing this reset signs out every
        existing session.
      </p>
      <form
        className="mt-7 grid gap-5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <FormField
          label="New password"
          error={errors.password?.message}
          required
        >
          {(field) => (
            <div className="relative">
              <Input
                {...field}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="pr-11"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-[var(--cb-text-muted)] hover:bg-[var(--cb-bg-subtle)]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          )}
        </FormField>
        <FormField
          label="Confirm new password"
          error={errors.confirmPassword?.message}
          required
        >
          {(field) => (
            <Input
              {...field}
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
          )}
        </FormField>
        {serverError && (
          <p
            role="alert"
            className="rounded-xl border border-[var(--cb-danger)] bg-[var(--cb-danger-soft)] p-3 text-sm text-[var(--cb-danger)]"
          >
            {serverError}
          </p>
        )}
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting && <LoaderCircle className="animate-spin" />}
          {isSubmitting ? 'Updating…' : 'Update password'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--cb-text-secondary)]">
        Need another link?{' '}
        <Link
          to="/forgot-password"
          className="font-bold text-[var(--cb-primary)] hover:underline"
        >
          Request password reset
        </Link>
      </p>
    </section>
  );
}
