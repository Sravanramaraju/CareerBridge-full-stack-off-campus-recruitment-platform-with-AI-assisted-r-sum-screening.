import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Check, Eye, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { FormField, Input, Select, TextArea } from '@/src/components/ui/Input';
import { EMPLOYMENT_TYPES, WORK_MODES } from '@/src/domain/constants';
import { cn } from '@/src/lib/utils';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';
import { useToast } from '@/src/components/feedback/ToastProvider';
import { jobSchema, jobStepFields } from '@/src/schemas/jobSchema';
import { recruiterService } from '@/src/services/recruiterService';
import { queryKeys } from '@/src/services/queryKeys';

const steps = [['Role basics', 'Describe the opportunity'], ['Requirements', 'Set clear expectations'], ['Review & publish', 'Check the candidate view']];

function splitSkills(value = '') { return value.split(',').map((skill) => skill.trim()).filter(Boolean); }
function splitLines(value = '') { return value.split('\n').map((item) => item.trim()).filter(Boolean); }
function parseScreeningQuestions(value = '') {
  return splitLines(value).map((line) => {
    const required = line.startsWith('*');
    return { question: line.replace(/^\*\s*/, ''), required };
  });
}

const workModeValues = { 'On-site': 'ON_SITE', Hybrid: 'HYBRID', Remote: 'REMOTE' };
const employmentTypeValues = { 'Full-time': 'FULL_TIME', 'Part-time': 'PART_TIME', Internship: 'INTERNSHIP', Contract: 'CONTRACT' };
const workModeLabels = { ON_SITE: 'On-site', HYBRID: 'Hybrid', REMOTE: 'Remote' };
const employmentTypeLabels = { FULL_TIME: 'Full-time', PART_TIME: 'Part-time', INTERNSHIP: 'Internship', CONTRACT: 'Contract' };

const emptyJob = {
  title: '', department: '', category: 'Engineering', employmentType: '', workMode: '',
  location: '', openings: 1, experienceMin: 0, experienceMax: 1, salaryMin: 5,
  salaryMax: 8, hideSalary: false, qualification: "Bachelor's degree or equivalent practical experience",
  requiredSkills: '', preferredSkills: '', description: '', responsibilities: '',
  deadline: '', contactVisible: true, screeningQuestions: '',
};

export function toFormJob(job) {
  if (!job) return emptyJob;
  return {
    title: job.title || '', department: job.department || '', category: job.category || 'Engineering',
    employmentType: employmentTypeLabels[job.employmentType] || '',
    workMode: workModeLabels[job.workMode] || '', location: job.location || '',
    openings: job.openings || 1, experienceMin: job.experienceMin ?? 0,
    experienceMax: job.experienceMax ?? 1,
    salaryMin: job.salaryMin === null ? 0 : Number(job.salaryMin) / 100000,
    salaryMax: job.salaryMax === null ? 0 : Number(job.salaryMax) / 100000,
    hideSalary: Boolean(job.hideSalary), qualification: job.qualification || '',
    requiredSkills: (job.skills || []).filter((item) => item.requirement === 'REQUIRED').map((item) => item.skill.name).join(', '),
    preferredSkills: (job.skills || []).filter((item) => item.requirement === 'PREFERRED').map((item) => item.skill.name).join(', '),
    description: job.description || '', responsibilities: (job.responsibilities || []).join('\n'),
    deadline: job.deadline ? new Date(job.deadline).toISOString().slice(0, 10) : '',
    contactVisible: job.contactVisible ?? true,
    screeningQuestions: (job.screeningQuestions || []).map((item) => `${item.required ? '* ' : ''}${item.question}`).join('\n'),
  };
}

export function toApiJob(values) {
  return {
    title: values.title.trim() || 'Untitled role', department: values.department.trim() || null,
    category: values.category.trim() || null, location: values.location.trim() || null,
    workMode: workModeValues[values.workMode] || null,
    employmentType: employmentTypeValues[values.employmentType] || null,
    openings: Number(values.openings) || 1, experienceMin: Number(values.experienceMin) || 0,
    experienceMax: Number(values.experienceMax) || 0,
    salaryMin: values.hideSalary ? null : Number(values.salaryMin) * 100000,
    salaryMax: values.hideSalary ? null : Number(values.salaryMax) * 100000,
    currency: 'INR', hideSalary: Boolean(values.hideSalary),
    summary: values.description.trim().slice(0, 500) || null,
    description: values.description.trim() || null,
    responsibilities: splitLines(values.responsibilities),
    qualification: values.qualification.trim() || null,
    contactVisible: Boolean(values.contactVisible), deadline: values.deadline || null,
    skills: [
      ...splitSkills(values.requiredSkills).map((name) => ({ name, requirement: 'REQUIRED' })),
      ...splitSkills(values.preferredSkills).map((name) => ({ name, requirement: 'PREFERRED' })),
    ],
    screeningQuestions: parseScreeningQuestions(values.screeningQuestions),
  };
}

export function JobFormPage() {
  const { jobId } = useParams();
  useDocumentTitle(jobId ? 'Edit job' : 'Post a job');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const existingQuery = useQuery({
    queryKey: queryKeys.recruiterJob(jobId),
    queryFn: ({ signal }) => recruiterService.getJob(jobId, { signal }),
    enabled: Boolean(jobId),
  });
  const existing = existingQuery.data;
  const [step, setStep] = useState(0);
  const { register, handleSubmit, getValues, trigger, watch, formState: { errors, isDirty, isSubmitting, isSubmitSuccessful } } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: emptyJob,
    values: toFormJob(existing),
  });
  const values = watch();

  useEffect(() => {
    if (!isDirty || isSubmitSuccessful) return undefined;
    const warnBeforeLeaving = (event) => event.preventDefault();
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [isDirty, isSubmitSuccessful]);

  async function nextStep() {
    const valid = await trigger(jobStepFields[step]);
    if (valid) setStep((current) => Math.min(2, current + 1));
  }

  async function persistJob(formValues) {
    const payload = toApiJob(formValues);
    return jobId
      ? recruiterService.updateJob(jobId, payload)
      : recruiterService.createJob(payload);
  }

  async function saveDraft() {
    try {
      await persistJob(getValues());
      await queryClient.invalidateQueries({ queryKey: queryKeys.recruiterJobs() });
      showToast('Draft saved to your hiring workspace.');
      void navigate('/recruiter/jobs');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to save this draft.', { tone: 'error' });
    }
  }

  async function publish(formValues) {
    try {
      const saved = await persistJob(formValues);
      if (saved.status === 'DRAFT') await recruiterService.publishJob(saved.id);
      await queryClient.invalidateQueries({ queryKey: queryKeys.recruiterJobs() });
      await queryClient.invalidateQueries({ queryKey: ['jobs'] });
      showToast(jobId && existing?.status === 'PUBLISHED' ? 'Job changes saved.' : 'Job published successfully.');
      void navigate('/recruiter/jobs');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to publish this job.', { tone: 'error' });
    }
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
              <FormField label="Screening questions" helper="Optional. Add one question per line, up to five. Prefix a required question with *." error={errors.screeningQuestions?.message}>{(field) => <TextArea {...field} className="min-h-28" placeholder="* Are you available to work in the listed location?" {...register('screeningQuestions')} />}</FormField>
            </div></section>
            <aside className="surface-card overflow-hidden xl:sticky xl:top-24"><div className="flex items-center gap-2 border-b bg-[var(--cb-bg-subtle)] px-5 py-3 text-xs font-bold"><Eye className="size-4 text-[var(--cb-primary)]" />Candidate preview</div><div className="p-5"><div className="flex flex-wrap gap-2"><Badge variant="primary">{values.workMode || 'Work mode'}</Badge><Badge>{values.employmentType || 'Employment type'}</Badge></div><h3 className="mt-4 font-heading text-xl font-extrabold">{values.title || 'Your job title'}</h3><p className="mt-1 text-sm font-semibold text-[var(--cb-text-secondary)]">Northstar Labs</p><p className="mt-4 text-xs text-[var(--cb-text-muted)]">{values.location || 'Location'} · {values.experienceMin || 0}–{values.experienceMax || 1} years</p><p className="mt-4 line-clamp-4 text-sm leading-6 text-[var(--cb-text-secondary)]">{values.description || 'Your role description will appear here as you complete the form.'}</p><div className="mt-4 flex flex-wrap gap-2">{splitSkills(values.requiredSkills).slice(0, 4).map((skill) => <Badge key={skill} variant="primary">{skill}</Badge>)}</div><p className="mt-5 border-t border-[var(--cb-divider)] pt-4 text-xs text-[var(--cb-text-muted)]">Preview only · review the published detail after submission.</p></div></aside>
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[var(--cb-divider)] pt-5 sm:flex-row sm:items-center sm:justify-between"><Button type="button" variant="ghost" onClick={saveDraft}><Save />Save draft</Button><div className="flex gap-2">{step > 0 && <Button type="button" variant="secondary" onClick={() => setStep((current) => current - 1)}><ArrowLeft />Back</Button>}{step < 2 ? <Button type="button" onClick={() => void nextStep()}>Continue<ArrowRight /></Button> : <Button type="submit" disabled={isSubmitting}><Check />{isSubmitting ? 'Publishing…' : 'Publish job'}</Button>}</div></div>
      </form>
    </div>
  );
}
