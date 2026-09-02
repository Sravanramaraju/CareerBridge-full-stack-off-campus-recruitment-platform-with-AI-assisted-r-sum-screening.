import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, BadgeCheck, Bookmark, BriefcaseBusiness, CalendarDays, Check,
  IndianRupee, MapPin, Send, Sparkles,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/src/components/ui/Badge';
import { ShareJobButton } from '@/src/components/jobs/ShareJobButton';
import { MatchBreakdown } from '@/src/components/jobs/MatchBreakdown';
import { MatchSummary } from '@/src/components/jobs/MatchSummary';
import { useToast } from '@/src/components/feedback/ToastProvider';
import { buttonVariants, Button } from '@/src/components/ui/Button';
import { EmptyState, Skeleton } from '@/src/components/ui/Feedback';
import { TextArea } from '@/src/components/ui/Input';
import { Modal, ModalContent, ModalTrigger } from '@/src/components/ui/Modal';
import { getCompanyById } from '@/src/data/mockData';
import { jobsService } from '@/src/services/jobsService';
import { queryKeys } from '@/src/services/queryKeys';
import { useAppStore } from '@/src/store/useAppStore';
import { cn } from '@/src/lib/utils';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';
import { matchService } from '@/src/services/matchService';

const responsibilities = [
  'Collaborate with product, design, and engineering teammates on focused product outcomes.',
  'Turn clear requirements into dependable, maintainable work with thoughtful documentation.',
  'Share progress early, ask useful questions, and incorporate feedback constructively.',
  'Improve quality through reviews, testing, and attention to the people using the product.',
];

const eligibility = [
  'You can clearly demonstrate the core skills through coursework, projects, internships, or employment.',
  'You are available for the stated work mode and location expectations.',
  'You can communicate your approach, trade-offs, and learning process with the hiring team.',
];

function JobDetailLoading() {
  return (
    <div className="page-container py-12" aria-label="Loading job details">
      <Skeleton className="h-5 w-28" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="surface-card p-7"><Skeleton className="h-14 w-14" /><Skeleton className="mt-6 h-8 w-3/4" /><Skeleton className="mt-3 h-5 w-1/3" /><Skeleton className="mt-8 h-32 w-full" /></div>
        <div className="surface-card p-6"><Skeleton className="h-11 w-full" /><Skeleton className="mt-4 h-11 w-full" /></div>
      </div>
    </div>
  );
}

export function JobDetailPage() {
  const { jobId } = useParams();
  const [coverNote, setCoverNote] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const { showToast } = useToast();
  const session = useAppStore((state) => state.session);
  const savedJobIds = useAppStore((state) => state.savedJobIds);
  const applications = useAppStore((state) => state.applications);
  const profile = useAppStore((state) => state.profile);
  const toggleSavedJob = useAppStore((state) => state.toggleSavedJob);
  const submitApplication = useAppStore((state) => state.submitApplication);
  const jobQuery = useQuery({ queryKey: queryKeys.job(jobId), queryFn: () => jobsService.getJobById(jobId) });
  useDocumentTitle(jobQuery.data?.title || 'Job details');

  if (jobQuery.isLoading) return <JobDetailLoading />;
  if (jobQuery.isError || !jobQuery.data) {
    return (
      <div className="page-container py-16">
        <EmptyState title="This role is not available" description="The job may have closed or the link may be incorrect." />
        <Link to="/jobs" className="mx-auto mt-5 flex w-fit items-center gap-2 text-sm font-bold text-[var(--cb-primary)]"><ArrowLeft className="size-4" />Back to jobs</Link>
      </div>
    );
  }

  const job = jobQuery.data;
  const company = getCompanyById(job.companyId);
  const isSaved = savedJobIds.includes(job.id);
  const application = applications.find((item) => item.jobId === job.id);
  const isApplicant = session?.role === 'applicant';
  const match = matchService.scoreJob(job, profile);

  function handleApply(event) {
    event.preventDefault();
    submitApplication(job.id, coverNote.trim());
    setModalOpen(false);
    showToast('Application submitted. You can now track it from your dashboard.');
  }

  function handleSave() {
    toggleSavedJob(job.id);
    showToast(isSaved ? 'Removed from saved jobs.' : 'Job saved.');
  }

  return (
    <div className="page-container py-8 pb-28 sm:py-10 lg:pb-10">
      <Link to="/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--cb-text-secondary)] hover:text-[var(--cb-primary)]"><ArrowLeft className="size-4" />Back to jobs</Link>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-6">
          <article className="surface-card p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl text-base font-extrabold text-white" style={{ backgroundColor: company.accent }} aria-hidden="true">{company.initials}</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><Badge variant="primary">Actively hiring</Badge><Badge>{job.employmentType}</Badge></div>
                <h1 className="mt-3 font-heading text-3xl font-extrabold leading-tight tracking-[-0.035em]">{job.title}</h1>
                <Link to={`/companies/${company.id}`} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--cb-text-secondary)] hover:text-[var(--cb-primary)]">{company.name}<BadgeCheck className="size-4 text-[var(--cb-emerald)]" aria-label="Verified employer" /></Link>
              </div>
            </div>
            <div className="mt-7 grid gap-3 border-y border-[var(--cb-divider)] py-5 text-sm text-[var(--cb-text-secondary)] sm:grid-cols-2">
              <span className="inline-flex items-center gap-2"><MapPin className="size-4 text-[var(--cb-text-muted)]" />{job.location} · {job.workMode}</span>
              <span className="inline-flex items-center gap-2"><BriefcaseBusiness className="size-4 text-[var(--cb-text-muted)]" />{job.experience}</span>
              <span className="inline-flex items-center gap-2"><IndianRupee className="size-4 text-[var(--cb-text-muted)]" />{job.salary.replace('₹', '')}</span>
              <span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-[var(--cb-text-muted)]" />Apply by {new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <p className="mt-6 text-base leading-7 text-[var(--cb-text-secondary)]">{job.summary}</p>
          </article>

          <article className="surface-card p-6 sm:p-8">
            <h2 className="font-heading text-xl font-bold">What you&apos;ll do</h2>
            <ul className="mt-5 grid gap-3">
              {responsibilities.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-[var(--cb-text-secondary)]"><Check className="mt-1 size-4 shrink-0 text-[var(--cb-emerald)]" aria-hidden="true" />{item}</li>)}
            </ul>
            <h2 className="mt-8 font-heading text-xl font-bold">Skills that help you succeed</h2>
            <div className="mt-4 flex flex-wrap gap-2">{job.skills.map((skill) => <Badge key={skill} variant="primary" className="min-h-8 px-3">{skill}</Badge>)}</div>
            <h2 className="mt-8 font-heading text-xl font-bold">Eligibility</h2>
            <ul className="mt-5 grid gap-3">
              {eligibility.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-[var(--cb-text-secondary)]"><Check className="mt-1 size-4 shrink-0 text-[var(--cb-emerald)]" aria-hidden="true" />{item}</li>)}
            </ul>
          </article>

          <article className="surface-card p-6 sm:p-8">
            <h2 className="font-heading text-xl font-bold">About {company.name}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--cb-text-secondary)]">{company.description}</p>
            <Link to={`/companies/${company.id}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--cb-primary)] hover:underline">View company profile</Link>
          </article>
        </div>

        <aside className="surface-card top-24 p-5 lg:sticky" aria-label="Application actions">
          {isApplicant && !application && (
            <div className="mb-5 rounded-xl bg-[var(--cb-primary-soft)] p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-[var(--cb-primary)]"><Sparkles className="size-4" />Your match guidance</p>
              <MatchSummary score={match.overall} className="mt-3" />
              <details className="mt-4"><summary className="cursor-pointer text-xs font-bold text-[var(--cb-primary)]">Why this match?</summary><div className="mt-4"><MatchBreakdown breakdown={match} /></div></details>
            </div>
          )}
          {application ? (
            <div className="rounded-xl bg-[var(--cb-emerald-soft)] p-4 text-center">
              <span className="mx-auto grid size-10 place-items-center rounded-full bg-[var(--cb-emerald)] text-white"><Check aria-hidden="true" /></span>
              <p className="mt-3 font-heading font-bold">Application submitted</p>
              <p className="mt-1 text-xs text-[var(--cb-text-secondary)]">Current status: {application.status}</p>
              <Link to={`/applicant/applications/${application.id}`} className="mt-4 inline-flex text-sm font-bold text-[var(--cb-primary)] hover:underline">Track application</Link>
            </div>
          ) : isApplicant ? (
            <Modal open={modalOpen} onOpenChange={setModalOpen}>
              <ModalTrigger render={<Button size="lg" className="w-full" />}><Send />Apply now</ModalTrigger>
              <ModalContent title={`Apply for ${job.title}`} description={`Your CareerBridge profile will be shared with ${company.name}.`}>
                <form onSubmit={handleApply}>
                  <label htmlFor="cover-note" className="text-sm font-semibold">Short note <span className="font-normal text-[var(--cb-text-muted)]">(optional)</span></label>
                  <TextArea id="cover-note" className="mt-2" value={coverNote} maxLength={500} onChange={(event) => setCoverNote(event.target.value)} placeholder="Share why this opportunity is relevant to you…" />
                  <p className="mt-1 text-right text-xs text-[var(--cb-text-muted)]">{coverNote.length}/500</p>
                  <div className="mt-5 flex justify-end"><Button type="submit"><Send />Submit application</Button></div>
                </form>
              </ModalContent>
            </Modal>
          ) : (
            <Link to={`/login?redirect=${encodeURIComponent(`/jobs/${job.id}`)}`} className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'w-full')}>Log in to apply</Link>
          )}
          <Button variant={isSaved ? 'soft' : 'secondary'} size="lg" className="mt-3 w-full" onClick={handleSave}><Bookmark className={isSaved ? 'fill-current' : ''} />{isSaved ? 'Saved' : 'Save job'}</Button>
          <div className="mt-3"><ShareJobButton jobTitle={job.title} /></div>
          <div className="mt-5 border-t border-[var(--cb-divider)] pt-5 text-xs leading-5 text-[var(--cb-text-muted)]">
            <p>Job ID: {job.id}</p>
            <p className="mt-1">CareerBridge demo listing · Report concerns through the company profile.</p>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-3 bottom-3 z-30 flex gap-2 rounded-2xl border border-[var(--cb-border)] bg-[var(--cb-surface-raised)] p-2 shadow-[var(--cb-shadow-raised)] lg:hidden" aria-label="Mobile application actions">
        <Button
          variant={isSaved ? 'soft' : 'secondary'}
          size="iconSm"
          onClick={handleSave}
          aria-label={isSaved ? 'Remove saved job' : 'Save job'}
        >
          <Bookmark className={isSaved ? 'fill-current' : ''} aria-hidden="true" />
        </Button>
        {application ? (
          <Link to={`/applicant/applications/${application.id}`} className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'flex-1')}>Track application</Link>
        ) : isApplicant ? (
          <Button size="lg" className="flex-1" onClick={() => setModalOpen(true)}><Send aria-hidden="true" />Apply now</Button>
        ) : (
          <Link to={`/login?redirect=${encodeURIComponent(`/jobs/${job.id}`)}`} className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'flex-1')}>Log in to apply</Link>
        )}
      </div>
    </div>
  );
}
