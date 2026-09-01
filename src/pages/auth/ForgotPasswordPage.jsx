import { useState } from 'react';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { FormField, Input } from '@/src/components/ui/Input';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';

export function ForgotPasswordPage() {
  useDocumentTitle('Reset password');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  if (sent) return (
    <section className="w-full max-w-md text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--cb-emerald-soft)] text-[var(--cb-emerald)]"><MailCheck /></span>
      <h1 className="mt-5 font-heading text-2xl font-extrabold">Check your inbox</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--cb-text-secondary)]">If an account exists for <strong>{email}</strong>, a demo recovery message has been sent.</p>
      <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--cb-primary)] hover:underline"><ArrowLeft className="size-4" />Back to login</Link>
    </section>
  );

  return (
    <section className="w-full max-w-md">
      <p className="text-sm font-bold text-[var(--cb-primary)]">Account recovery</p>
      <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Reset your password</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--cb-text-secondary)]">Enter your email and we&apos;ll simulate sending recovery instructions.</p>
      <form className="mt-7 grid gap-5" onSubmit={(event) => { event.preventDefault(); if (email.includes('@')) setSent(true); }}>
        <FormField label="Email address" required>{(field) => <Input {...field} type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />}</FormField>
        <Button type="submit" size="lg">Send recovery link</Button>
      </form>
      <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--cb-primary)] hover:underline"><ArrowLeft className="size-4" />Back to login</Link>
    </section>
  );
}
