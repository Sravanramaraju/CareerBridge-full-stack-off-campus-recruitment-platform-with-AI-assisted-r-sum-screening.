import { useMemo, useState } from 'react';
import { ArrowLeft, Search, SlidersHorizontal, UserRoundSearch } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Avatar } from '@/src/components/ui/Avatar';
import { CandidateMatchDialog } from '@/src/components/candidates/CandidateMatchDialog';
import { Badge } from '@/src/components/ui/Badge';
import { EmptyState, ProgressBar } from '@/src/components/ui/Feedback';
import { getCompanyById, jobs, recruiterCandidates } from '@/src/data/mockData';
import { useAppStore } from '@/src/store/useAppStore';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';

const statusOptions = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Offered', 'Rejected'];

export function CandidatePipelinePage() {
  const { jobId } = useParams();
  useDocumentTitle('Candidate pipeline');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [minimumMatch, setMinimumMatch] = useState('0');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [matchCandidate, setMatchCandidate] = useState(null);
  const recruiterDrafts = useAppStore((state) => state.recruiterDrafts);
  const statuses = useAppStore((state) => state.candidateStatuses);
  const updateCandidateStatus = useAppStore((state) => state.updateCandidateStatus);
  const job = recruiterDrafts.find((item) => item.id === jobId) || jobs.find((item) => item.id === jobId);

  const candidates = useMemo(() => recruiterCandidates.filter((candidate) => {
    const currentStatus = statuses[candidate.applicationId] || candidate.status;
    const keyword = search.trim().toLocaleLowerCase();
    const matchesSearch = !keyword || [candidate.name, candidate.headline, ...candidate.skills].join(' ').toLocaleLowerCase().includes(keyword);
    const matchesStatus = !statusFilter || currentStatus === statusFilter;
    const matchesScore = candidate.match >= Number(minimumMatch);
    const matchesExperience = !experience || candidate.experience === experience;
    const matchesLocation = !location.trim() || candidate.location.toLocaleLowerCase().includes(location.trim().toLocaleLowerCase());
    return candidate.jobId === jobId && matchesSearch && matchesStatus && matchesScore && matchesExperience && matchesLocation;
  }), [experience, jobId, location, minimumMatch, search, statusFilter, statuses]);

  if (!job) return <EmptyState title="Job not found" description="This role may have been removed from your local hiring workspace." />;
  const company = getCompanyById(job.companyId);
  const totalCandidates = recruiterCandidates.filter((candidate) => candidate.jobId === jobId).length;

  return (
    <div>
      <Link to="/recruiter/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--cb-text-secondary)] hover:text-[var(--cb-primary)]"><ArrowLeft className="size-4" />Back to jobs</Link>
      <header className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><Badge variant="success">{job.status || 'Published'}</Badge><span className="text-xs text-[var(--cb-text-muted)]">{totalCandidates} applicants</span></div><h1 className="mt-3 font-heading text-3xl font-extrabold tracking-[-0.035em]">{job.title}</h1><p className="mt-2 text-sm text-[var(--cb-text-secondary)]">{company?.name || 'Northstar Labs'} · Candidate pipeline</p></div><Link to={`/recruiter/jobs/${job.id}/edit`} className="text-sm font-bold text-[var(--cb-primary)] hover:underline">Edit job details</Link></header>

      <section className="surface-card mt-7 p-4" aria-label="Candidate filters">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--cb-text-muted)]"><SlidersHorizontal className="size-4" />FILTER CANDIDATES</div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_0.8fr_0.7fr_0.8fr_0.8fr]">
          <label className="flex h-10 items-center gap-2 rounded-lg border bg-[var(--cb-surface)] px-3"><Search className="size-4 text-[var(--cb-text-muted)]" /><span className="sr-only">Search candidate name or skill</span><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Name, headline, or skill" /></label>
          <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-lg border bg-[var(--cb-surface)] px-3 text-sm outline-none"><option value="">All statuses</option>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select>
          <select aria-label="Minimum match score" value={minimumMatch} onChange={(event) => setMinimumMatch(event.target.value)} className="h-10 rounded-lg border bg-[var(--cb-surface)] px-3 text-sm outline-none"><option value="0">Any match</option><option value="80">80%+</option><option value="85">85%+</option><option value="90">90%+</option></select>
          <select aria-label="Filter by experience" value={experience} onChange={(event) => setExperience(event.target.value)} className="h-10 rounded-lg border bg-[var(--cb-surface)] px-3 text-sm outline-none"><option value="">Any experience</option>{[...new Set(recruiterCandidates.map((candidate) => candidate.experience))].map((item) => <option key={item}>{item}</option>)}</select>
          <input aria-label="Filter by location" value={location} onChange={(event) => setLocation(event.target.value)} className="h-10 rounded-lg border bg-[var(--cb-surface)] px-3 text-sm outline-none" placeholder="Location" />
        </div>
      </section>

      {candidates.length === 0 && <EmptyState className="mt-6" icon={UserRoundSearch} title="No candidates match these filters" description="Try a broader status, match range, skill, or location." />}
      {candidates.length > 0 && (
        <div className="surface-card mt-6 overflow-x-auto">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-[1.3fr_110px_90px_1fr_90px_90px_150px_70px] gap-3 border-b bg-[var(--cb-bg-subtle)] px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[var(--cb-text-muted)]"><span>Candidate</span><span>Match</span><span>Experience</span><span>Skills</span><span>Location</span><span>Applied</span><span>Status</span><span>Action</span></div>
            <div className="divide-y divide-[var(--cb-divider)]">{candidates.map((candidate) => { const currentStatus = statuses[candidate.applicationId] || candidate.status; return (
              <article key={candidate.applicationId} className="grid grid-cols-[1.3fr_110px_90px_1fr_90px_90px_150px_70px] items-center gap-3 px-5 py-4 hover:bg-[var(--cb-bg-subtle)]">
                <div className="flex min-w-0 items-center gap-3"><Avatar name={candidate.name} size="sm" /><div className="min-w-0"><Link to={`/recruiter/candidates/${candidate.applicationId}`} className="block truncate text-sm font-bold hover:text-[var(--cb-primary)]">{candidate.name}</Link><p className="truncate text-[10px] text-[var(--cb-text-muted)]">{candidate.headline}</p></div></div>
                <button type="button" onClick={() => setMatchCandidate(candidate)} className="rounded-lg p-1 text-left hover:bg-[var(--cb-emerald-soft)]" aria-label={`Explain ${candidate.match}% match for ${candidate.name}`}><span className="block text-xs font-bold text-[var(--cb-emerald)]">{candidate.match}%</span><ProgressBar value={candidate.match} className="mt-1" /></button>
                <span className="text-xs text-[var(--cb-text-secondary)]">{candidate.experience}</span>
                <div className="flex flex-wrap gap-1">{candidate.skills.slice(0, 2).map((skill) => <Badge key={skill} className="text-[10px]">{skill}</Badge>)}{candidate.skills.length > 2 && <span className="text-[10px] text-[var(--cb-text-muted)]">+{candidate.skills.length - 2}</span>}</div>
                <span className="truncate text-xs text-[var(--cb-text-secondary)]">{candidate.location}</span>
                <span className="text-xs text-[var(--cb-text-secondary)]">{new Date(candidate.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                <select aria-label={`Status for ${candidate.name}`} value={currentStatus} onChange={(event) => updateCandidateStatus(candidate.applicationId, event.target.value)} className="h-9 rounded-lg border bg-[var(--cb-surface)] px-2 text-xs font-semibold outline-none focus:border-[var(--cb-primary)]">{statusOptions.map((status) => <option key={status}>{status}</option>)}</select>
                <Link to={`/recruiter/candidates/${candidate.applicationId}`} className="text-xs font-bold text-[var(--cb-primary)] hover:underline">Review</Link>
              </article>
            ); })}</div>
          </div>
        </div>
      )}
      <p className="mt-4 text-xs leading-5 text-[var(--cb-text-muted)]">Match percentages are mock assistance signals based only on job-relevant skills, experience, eligibility, and work preferences. They are not hiring decisions.</p>
      <CandidateMatchDialog candidate={matchCandidate} onClose={() => setMatchCandidate(null)} />
    </div>
  );
}
