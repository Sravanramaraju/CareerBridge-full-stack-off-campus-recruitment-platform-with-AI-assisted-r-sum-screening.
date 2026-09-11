import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Search, SlidersHorizontal, UserRoundSearch } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Avatar } from '@/src/components/ui/Avatar';
import { CandidateMatchDialog } from '@/src/components/candidates/CandidateMatchDialog';
import { Badge } from '@/src/components/ui/Badge';
import { EmptyState, ProgressBar, Skeleton } from '@/src/components/ui/Feedback';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';
import { useToast } from '@/src/components/feedback/ToastProvider';
import { recruiterService } from '@/src/services/recruiterService';
import { queryKeys } from '@/src/services/queryKeys';

const statusOptions = [
  ['APPLIED', 'Applied'], ['UNDER_REVIEW', 'Under Review'], ['SHORTLISTED', 'Shortlisted'],
  ['INTERVIEW', 'Interview'], ['OFFERED', 'Offered'], ['REJECTED', 'Rejected'],
  ['WITHDRAWN', 'Withdrawn'],
];

const statusLabels = Object.fromEntries(statusOptions);

export function CandidatePipelinePage() {
  const { jobId } = useParams();
  useDocumentTitle('Candidate pipeline');
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [minimumMatch, setMinimumMatch] = useState('0');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [matchCandidate, setMatchCandidate] = useState(null);
  const queryClient = useQueryClient();
  const filters = useMemo(() => ({
    q: search.trim() || undefined,
    status: statusFilter || undefined,
    minMatch: Number(minimumMatch),
    minExperienceMonths: experience ? Number(experience) : undefined,
    location: location.trim() || undefined,
    page: 1,
    pageSize: 50,
  }), [experience, location, minimumMatch, search, statusFilter]);
  const candidatesQuery = useQuery({
    queryKey: queryKeys.jobApplicants(jobId, filters),
    queryFn: ({ signal }) => recruiterService.getCandidates(jobId, filters, { signal }),
  });
  const statusMutation = useMutation({
    mutationFn: ({ applicationId, status }) => recruiterService.updateCandidateStatus(applicationId, status),
    onSuccess: (_application, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['job-applicants', jobId] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.recruiterApplication(variables.applicationId) });
      showToast('Candidate status updated.');
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Unable to update candidate status.', { tone: 'error' }),
  });
  const job = candidatesQuery.data?.job;
  const candidates = candidatesQuery.data?.items || [];
  const totalCandidates = candidatesQuery.data?.pagination.total || 0;

  if (candidatesQuery.isLoading) return <div aria-label="Loading candidate pipeline"><Skeleton className="h-24" /><Skeleton className="mt-6 h-96" /></div>;
  if (candidatesQuery.isError || !job) return <EmptyState title="Candidate pipeline could not be loaded" description="This role may be unavailable or you may no longer have access." actionLabel="Try again" onAction={() => candidatesQuery.refetch()} />;

  function changeCandidateStatus(candidate, status) {
    statusMutation.mutate({ applicationId: candidate.applicationId, status });
  }

  return (
    <div>
      <Link to="/recruiter/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--cb-text-secondary)] hover:text-[var(--cb-primary)]"><ArrowLeft className="size-4" />Back to jobs</Link>
      <header className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><Badge variant="success">{job.status}</Badge><span className="text-xs text-[var(--cb-text-muted)]">{totalCandidates} applicants</span></div><h1 className="mt-3 font-heading text-3xl font-extrabold tracking-[-0.035em]">{job.title}</h1><p className="mt-2 text-sm text-[var(--cb-text-secondary)]">{job.company?.name || 'Your company'} · Candidate pipeline</p></div><Link to={`/recruiter/jobs/${job.id}/edit`} className="text-sm font-bold text-[var(--cb-primary)] hover:underline">Edit job details</Link></header>

      <section className="surface-card mt-7 p-4" aria-label="Candidate filters">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--cb-text-muted)]"><SlidersHorizontal className="size-4" />FILTER CANDIDATES</div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_0.8fr_0.7fr_0.8fr_0.8fr]">
          <label className="flex h-10 items-center gap-2 rounded-lg border bg-[var(--cb-surface)] px-3"><Search className="size-4 text-[var(--cb-text-muted)]" /><span className="sr-only">Search candidate name or skill</span><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Name, headline, or skill" /></label>
          <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-lg border bg-[var(--cb-surface)] px-3 text-sm outline-none"><option value="">All statuses</option>{statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <select aria-label="Minimum match score" value={minimumMatch} onChange={(event) => setMinimumMatch(event.target.value)} className="h-10 rounded-lg border bg-[var(--cb-surface)] px-3 text-sm outline-none"><option value="0">Any match</option><option value="80">80%+</option><option value="85">85%+</option><option value="90">90%+</option></select>
          <select aria-label="Filter by experience" value={experience} onChange={(event) => setExperience(event.target.value)} className="h-10 rounded-lg border bg-[var(--cb-surface)] px-3 text-sm outline-none"><option value="">Any experience</option><option value="6">6+ months</option><option value="12">1+ year</option><option value="24">2+ years</option></select>
          <input aria-label="Filter by location" value={location} onChange={(event) => setLocation(event.target.value)} className="h-10 rounded-lg border bg-[var(--cb-surface)] px-3 text-sm outline-none" placeholder="Location" />
        </div>
      </section>

      {candidates.length === 0 && <EmptyState className="mt-6" icon={UserRoundSearch} title="No candidates match these filters" description="Try a broader status, match range, skill, or location." />}
      {candidates.length > 0 && (
        <div className="surface-card mt-6 overflow-x-auto">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-[1.3fr_110px_90px_1fr_90px_90px_150px_70px] gap-3 border-b bg-[var(--cb-bg-subtle)] px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[var(--cb-text-muted)]"><span>Candidate</span><span>Match</span><span>Experience</span><span>Skills</span><span>Location</span><span>Applied</span><span>Status</span><span>Action</span></div>
            <div className="divide-y divide-[var(--cb-divider)]">{candidates.map((candidate) => (
              <article key={candidate.applicationId} className="grid grid-cols-[1.3fr_110px_90px_1fr_90px_90px_150px_70px] items-center gap-3 px-5 py-4 hover:bg-[var(--cb-bg-subtle)]">
                <div className="flex min-w-0 items-center gap-3"><Avatar name={candidate.name} size="sm" /><div className="min-w-0"><Link to={`/recruiter/candidates/${candidate.applicationId}`} className="block truncate text-sm font-bold hover:text-[var(--cb-primary)]">{candidate.name}</Link><p className="truncate text-[10px] text-[var(--cb-text-muted)]">{candidate.headline}</p></div></div>
                <button type="button" onClick={() => setMatchCandidate(candidate)} className="rounded-lg p-1 text-left hover:bg-[var(--cb-emerald-soft)]" aria-label={`Explain match for ${candidate.name}`}><span className="block text-xs font-bold text-[var(--cb-emerald)]">{Number.isFinite(candidate.match) ? `${candidate.match}%` : 'Unavailable'}</span>{Number.isFinite(candidate.match) && <ProgressBar value={candidate.match} className="mt-1" />}</button>
                <span className="text-xs text-[var(--cb-text-secondary)]">{candidate.experience}</span>
                <div className="flex flex-wrap gap-1">{candidate.skills.slice(0, 2).map((skill) => <Badge key={skill} className="text-[10px]">{skill}</Badge>)}{candidate.skills.length > 2 && <span className="text-[10px] text-[var(--cb-text-muted)]">+{candidate.skills.length - 2}</span>}</div>
                <span className="truncate text-xs text-[var(--cb-text-secondary)]">{candidate.location}</span>
                <span className="text-xs text-[var(--cb-text-secondary)]">{new Date(candidate.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                <select aria-label={`Status for ${candidate.name}`} value={candidate.statusCode} disabled={statusMutation.isPending || !candidate.allowedTransitions?.length} onChange={(event) => changeCandidateStatus(candidate, event.target.value)} className="h-9 rounded-lg border bg-[var(--cb-surface)] px-2 text-xs font-semibold outline-none focus:border-[var(--cb-primary)]"><option value={candidate.statusCode}>{candidate.status}</option>{(candidate.allowedTransitions || []).map((status) => <option key={status} value={status}>{statusLabels[status] || status}</option>)}</select>
                <Link to={`/recruiter/candidates/${candidate.applicationId}`} className="text-xs font-bold text-[var(--cb-primary)] hover:underline">Review</Link>
              </article>
            ))}</div>
          </div>
        </div>
      )}
      <p className="mt-4 text-xs leading-5 text-[var(--cb-text-muted)]">Match percentages are explainable assistance signals based only on job-relevant skills, experience, eligibility, work preferences, and available résumé similarity. They are not hiring decisions.</p>
      <CandidateMatchDialog candidate={matchCandidate} onClose={() => setMatchCandidate(null)} />
    </div>
  );
}
