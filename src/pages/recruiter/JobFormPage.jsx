import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Check, Eye, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { FormField, Input, Select, TextArea } from '@/src/components/ui/Input';
import { jobs } from '@/src/data/mockData';
import { EMPLOYMENT_TYPES, WORK_MODES } from '@/src/domain/constants';
import { useAppStore } from '@/src/store/useAppStore';
import { cn } from '@/src/lib/utils';

const jobSchema = z.object({
  title: z.string().min(3, 'Enter a clear job title.'),
  department: z.string().min(2, 'Enter a department.'),
  category: z.string().min(2, 'Choose a role category.'),
  employmentType: z.string().min(1, 'Choose an employment type.'),
  workMode: z.string().min(1, 'Choose a work mode.'),
  location: z.string().min(2, 'Enter at least one location.'),
  openings: z.coerce.number().min(1, 'At least one opening is required.').max(50),
  experienceMin: z.coerce.number().min(0).max(20),
  experienceMax: z.coerce.number().min(0).max(20),
  salaryMin: z.coerce.number().min(0),
  salaryMax: z.coerce.number().min(0),
  hideSalary: z.boolean(),
  qualification: z.string().min(2, 'Add a minimum qualification.'),
  requiredSkills: z.string().min(2, 'Add at least one required skill.'),
  preferredSkills: z.string(),
  description: z.string().min(80, 'Write at least 80 characters about the role.'),
  responsibilities: z.string().min(40, 'Add a few core responsibilities.'),
  deadline: z.string().min(1, 'Choose an application deadline.'),
  contactVisible: z.boolean(),
  screeningQuestions: z.string(),
}).refine((values) => values.experienceMax >= values.experienceMin, { message: 'Maximum must be greater than minimum.', path: ['experienceMax'] })
  .refine((values) => values.hideSalary || values.salaryMax >= values.salaryMin, { message: 'Maximum must be greater than minimum.', path: ['salaryMax'] })
  .refine((values) => values.screeningQuestions.split('\n').filter((question) => question.trim()).length <= 5, { message: 'Add no more than five screening questions.', path: ['screeningQuestions'] });

const stepFields = [
  ['title', 'department', 'category', 'employmentType', 'workMode', 'location', 'openings'],
  ['experienceMin', 'experienceMax', 'salaryMin', 'salaryMax', 'qualification', 'requiredSkills', 'description', 'responsibilities'],
];

const steps = [['Role basics', 'Describe the opportunity'], ['Requirements', 'Set clear expectations'], ['Review & publish', 'Check the candidate view']];

function splitSkills(value = '') { return value.split(',').map((skill) => skill.trim()).filter(Boolean); }
function makeSlug(value = '') { return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'new-role'; }

export function JobFormPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const recruiterDrafts = useAppStore((state) => state.recruiterDrafts);
  const saveRecruiterDraft = useAppStore((state) => state.saveRecruiterDraft);
  const existing = recruiterDrafts.find((item) => item.id === jobId) || jobs.find((item) => item.id === jobId);
  const [step, setStep] = useState(0);
  const { register, handleSubmit, getValues, trigger, watch, formState: { errors, isDirty, isSubmitting, isSubmitSuccessful } } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: existing?.title || '', department: existing?.department || '', category: existing?.category || 'Engineering', employmentType: existing?.employmentType || '', workMode: existing?.workMode || '', location: existing?.location || '', openings: existing?.openings || 1,
      experienceMin: existing?.experienceMin ?? 0, experienceMax: existing?.experienceMax ?? 1, salaryMin: existing?.salaryMin ?? 5, salaryMax: existing?.salaryMax ?? 8, hideSalary: existing?.hideSalary || false, qualification: existing?.qualification || "Bachelor's degree or equivalent practical experience", requiredSkills: existing?.requiredSkills || existing?.skills?.join(', ') || '', preferredSkills: existing?.preferredSkills || '', description: existing?.description || existing?.summary || '', responsibilities: existing?.responsibilities || '',
      deadline: existing?.deadline || '2026-09-30', contactVisible: existing?.contactVisible ?? true, screeningQuestions: existing?.screeningQuestions || '',
    },
  });
  const values = watch();

  useEffect(() => {
    if (!isDirty || isSubmitSuccessful) return undefined;
    const warnBeforeLeaving = (event) => event.preventDefault();
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [isDirty, isSubmitSuccessful]);

  async function nextStep() {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((current) => Math.min(2, current + 1));
  }

  function normaliseJob(formValues, status) {
    const id = jobId || `${makeSlug(formValues.title)}-${recruiterDrafts.length + 1}`;
    return {
      id, title: formValues.title || 'Untitled role', companyId: existing?.companyId || 'northstar-labs', department: formValues.department, category: formValues.category, employmentType: formValues.employmentType, workMode: formValues.workMode, location: formValues.location, openings: Number(formValues.openings) || 1,
      experience: `${formValues.experienceMin || 0}–${formValues.experienceMax || 1} years`, experienceMin: Number(formValues.experienceMin) || 0, experienceMax: Number(formValues.experienceMax) || 1, salary: formValues.hideSalary ? 'Salary not disclosed' : `₹${formValues.salaryMin || 0}–${formValues.salaryMax || 0} LPA`, salaryMin: Number(formValues.salaryMin) || 0, salaryMax: Number(formValues.salaryMax) || 0, hideSalary: Boolean(formValues.hideSalary), qualification: formValues.qualification,
      skills: splitSkills(formValues.requiredSkills), requiredSkills: formValues.requiredSkills, preferredSkills: formValues.preferredSkills, description: formValues.description, summary: formValues.description.slice(0, 150), responsibilities: formValues.responsibilities, deadline: formValues.deadline, contactVisible: Boolean(formValues.contactVisible), screeningQuestions: formValues.screeningQuestions, status, updatedAt: '2026-09-01', postedAt: existing?.postedAt || '2026-09-01', applications: existing?.applications || 0,
    };
  }

  function saveDraft() {
    saveRecruiterDraft(normaliseJob(getValues(), 'Draft'));
    void navigate('/recruiter/jobs');
  }

  async function publish(formValues) {
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    saveRecruiterDraft(normaliseJob(formValues, 'Published'));
    void navigate('/recruiter/jobs');
  }

  return (
    <div>
      <Link to="/recruiter/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--cb-text-secondary)] hover:text-[var(--cb-primary)]"><ArrowLeft className="size-4" />Back to jobs</Link>
      <header className="mt-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--cb-primary)]">{jobId ? 'Edit opportunity' : 'New opportunity'}</p><h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">{jobId ? 'Update job details' : 'Post a job'}</h1><p className="mt-2 text-sm text-[var(--cb-text-secondary)]">Create a clear role candidates can understand and evaluate.</p></header>

      <ol className="mt-7 grid gap-2 sm:grid-cols-3" aria-label="Job form progress">{steps.map(([title, copy], index) => <li key={title} className={cn('flex items-center gap-3 rounded-xl border p-3', index === step ? 'border-[var(--cb-primary)] bg-[var(--cb-primary-soft)]' : index < step ? 'border-[var(--cb-emerald)] bg-[var(--cb-emerald-soft)]' : 'bg-[var(--cb-surface)]')}><span className={cn('grid size-8 shrink-0 place-items-center rounded-full text-xs font-extrabold', index === step ? 'bg-[var(--cb-primary)] text-white' : index < step ? 'bg-[var(--cb-emerald)] text-white' : 'bg-[var(--cb-bg-subtle)] text-[var(--cb-text-muted)]')}>{index < step ? <Check className="size-4" /> : index + 1}</span><span><strong className="block text-sm">{title}</strong><span className="hidden text-[10px] text-[var(--cb-text-muted)] lg:block">{copy}</span></span></li>)}</ol>

      <form onSubmit={handleSubmit(publish)} className="mt-6">
        {step === 0 && (
          <section className="surface-card p-6 sm:p-8"><h2 className="font-heading text-xl font-bold">Role basics</h2><p className="mt-1 text-xs text-[var(--cb-text-muted)]">Start with the information candidates use to understand the opportunity.</p><div className="mt-6 grid gap-5 sm:grid-cols-2">
            <FormField label="Job title" error={errors.title?.message} required className="sm:col-span-2">{(field) => <Input {...field} placeholder="e.g. Graduate Frontend Engineer" {...register('title')} />}</FormField>
            <FormField label="Department" error={errors.department?.message} required>{(field) => <Input {...field} placeholder="e.g. Engineering" {...register('department')} />}</FormField>
            <FormField label="Role category" error={errors.category?.message} required>{(field) => <Select {...field} {...register('category')}><option>Engineering</option><option>Data</option><option>Design</option><option>Operations</option><option>Sales</option><option>Finance</option></Select>}</FormField>
            <FormField label="Employment type" error={errors.employmentType?.message} required>{(field) => <Select {...field} {...register('employmentType')}><option value="">Select type</option>{EMPLOYMENT_TYPES.map((type) => <option key={type}>{type}</option>)}</Select>}</FormField>
            <FormField label="Work mode" error={errors.workMode?.message} required>{(field) => <Select {...field} {...register('workMode')}><option value="">Select mode</option>{WORK_MODES.map((mode) => <option key={mode}>{mode}</option>)}</Select>}</FormField>
            <FormField label="Location" error={errors.location?.message} required>{(field) => <Input {...field} placeholder="Bengaluru, Karnataka" {...register('location')} />}</FormField>
            <FormField label="Number of openings" error={errors.openings?.message} required>{(field) => <Input {...field} type="number" min="1" max="50" {...register('openings', { valueAsNumber: true })} />}</FormField>
          </div></section>
        )}

        {step === 1 && (
          <section className="surface-card p-6 sm:p-8"><h2 className="font-heading text-xl font-bold">Requirements and role detail</h2><p className="mt-1 text-xs text-[var(--cb-text-muted)]">Keep requirements proportional to the level of the role.</p><div className="mt-6 grid gap-5 sm:grid-cols-2">
            <FormField label="Minimum experience (years)" error={errors.experienceMin?.message} required>{(field) => <Input {...field} type="number" min="0" {...register('experienceMin', { valueAsNumber: true })} />}</FormField>
            <FormField label="Maximum experience (years)" error={errors.experienceMax?.message} required>{(field) => <Input {...field} type="number" min="0" {...register('experienceMax', { valueAsNumber: true })} />}</FormField>
            <FormField label="Minimum salary (LPA)" error={errors.salaryMin?.message} required>{(field) => <Input {...field} type="number" min="0" step="0.5" {...register('salaryMin', { valueAsNumber: true })} />}</FormField>
            <FormField label="Maximum salary (LPA)" error={errors.salaryMax?.message} required>{(field) => <Input {...field} type="number" min="0" step="0.5" {...register('salaryMax', { valueAsNumber: true })} />}</FormField>
            <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2"><input type="checkbox" className="size-4 accent-[var(--cb-primary)]" {...register('hideSalary')} />Hide salary from candidates</label>
            <FormField label="Minimum qualification" error={errors.qualification?.message} required className="sm:col-span-2">{(field) => <Input {...field} placeholder="Degree or equivalent practical experience" {...register('qualification')} />}</FormField>
            <FormField label="Required skills" helper="Comma-separated, job-relevant skills only." error={errors.requiredSkills?.message} required>{(field) => <Input {...field} placeholder="React, JavaScript, CSS" {...register('requiredSkills')} />}</FormField>
            <FormField label="Preferred skills" helper="Helpful but not mandatory." error={errors.preferredSkills?.message}>{(field) => <Input {...field} placeholder="Testing, Accessibility" {...register('preferredSkills')} />}</FormField>
            <FormField label="Job description" error={errors.description?.message} required className="sm:col-span-2">{(field) => <TextArea {...field} className="min-h-36" placeholder="Explain the team, problem space, and what success looks like…" {...register('description')} />}</FormField>
            <FormField label="Responsibilities" error={errors.responsibilities?.message} required className="sm:col-span-2">{(field) => <TextArea {...field} className="min-h-28" placeholder="Add one responsibility per line…" {...register('responsibilities')} />}</FormField>
          </div></section>
        )}

        {step === 2 && (
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <section className="surface-card p-6 sm:p-8"><h2 className="font-heading text-xl font-bold">Application and review</h2><p className="mt-1 text-xs text-[var(--cb-text-muted)]">Set a realistic deadline and review the candidate-facing summary.</p><div className="mt-6 grid gap-5">
              <FormField label="Application deadline" error={errors.deadline?.message} required>{(field) => <Input {...field} type="date" {...register('deadline')} />}</FormField>
              <label className="flex items-start gap-3 rounded-xl border p-4"><input type="checkbox" className="mt-0.5 size-4 accent-[var(--cb-primary)]" {...register('contactVisible')} /><span><strong className="block text-sm">Show recruiter contact to applicants</strong><span className="mt-1 block text-xs text-[var(--cb-text-muted)]">Display the demo recruiter identity on the published role.</span></span></label>
              <FormField label="Screening questions" helper="Optional. Add one question per line, up to five." error={errors.screeningQuestions?.message}>{(field) => <TextArea {...field} className="min-h-28" placeholder="Are you available to work in the listed location?" {...register('screeningQuestions')} />}</FormField>
            </div></section>
            <aside className="surface-card overflow-hidden xl:sticky xl:top-24"><div className="flex items-center gap-2 border-b bg-[var(--cb-bg-subtle)] px-5 py-3 text-xs font-bold"><Eye className="size-4 text-[var(--cb-primary)]" />Candidate preview</div><div className="p-5"><div className="flex flex-wrap gap-2"><Badge variant="primary">{values.workMode || 'Work mode'}</Badge><Badge>{values.employmentType || 'Employment type'}</Badge></div><h3 className="mt-4 font-heading text-xl font-extrabold">{values.title || 'Your job title'}</h3><p className="mt-1 text-sm font-semibold text-[var(--cb-text-secondary)]">Northstar Labs</p><p className="mt-4 text-xs text-[var(--cb-text-muted)]">{values.location || 'Location'} · {values.experienceMin || 0}–{values.experienceMax || 1} years</p><p className="mt-4 line-clamp-4 text-sm leading-6 text-[var(--cb-text-secondary)]">{values.description || 'Your role description will appear here as you complete the form.'}</p><div className="mt-4 flex flex-wrap gap-2">{splitSkills(values.requiredSkills).slice(0, 4).map((skill) => <Badge key={skill} variant="primary">{skill}</Badge>)}</div><p className="mt-5 border-t border-[var(--cb-divider)] pt-4 text-xs text-[var(--cb-text-muted)]">Preview only · review the published detail after submission.</p></div></aside>
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[var(--cb-divider)] pt-5 sm:flex-row sm:items-center sm:justify-between"><Button type="button" variant="ghost" onClick={saveDraft}><Save />Save draft</Button><div className="flex gap-2">{step > 0 && <Button type="button" variant="secondary" onClick={() => setStep((current) => current - 1)}><ArrowLeft />Back</Button>}{step < 2 ? <Button type="button" onClick={() => void nextStep()}>Continue<ArrowRight /></Button> : <Button type="submit" disabled={isSubmitting}><Check />{isSubmitting ? 'Publishing…' : 'Publish job'}</Button>}</div></div>
      </form>
    </div>
  );
}
