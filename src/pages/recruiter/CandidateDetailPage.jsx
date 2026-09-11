import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, BookOpen, BriefcaseBusiness, FileText, History, MapPin, Save, ShieldCheck,
  Trash2,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Avatar } from '@/src/components/ui/Avatar';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { EmptyState, ProgressBar, Skeleton } from '@/src/components/ui/Feedback';
import { Input, TextArea } from '@/src/components/ui/Input';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';
import { useToast } from '@/src/components/feedback/ToastProvider';
import { queryKeys } from '@/src/services/queryKeys';
import { recruiterService } from '@/src/services/recruiterService';
import { useAppStore } from '@/src/store/useAppStore';

const statusLabels = Object.freeze({
  APPLIED: 'Applied', UNDER_REVIEW: 'Under Review', SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview', OFFERED: 'Offered', REJECTED: 'Rejected', WITHDRAWN: 'Withdrawn',
});

function readableDate(value, options = {}) {
  if (!value) return 'Not provided';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', ...options,
  });
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function statusVariant(status) {
  if (status === 'REJECTED' || status === 'WITHDRAWN') return 'danger';
  if (status === 'INTERVIEW' || status === 'OFFERED') return 'success';
  return status === 'SHORTLISTED' ? 'primary' : 'neutral';
}

export function CandidateDetailPage() {
  const { applicationId } = useParams();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const sessionUserId = useAppStore((state) => state.session?.id);
  const [nextStatus, setNextStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [note, setNote] = useState('');

  const candidateQuery = useQuery({
    queryKey: queryKeys.recruiterApplication(applicationId),
    queryFn: ({ signal }) => recruiterService.getApplication(applicationId, { signal }),
  });
  const notesQuery = useQuery({
    queryKey: queryKeys.recruiterNotes(applicationId),
    queryFn: ({ signal }) => recruiterService.getPrivateNotes(applicationId, { signal }),
  });
  const candidate = candidateQuery.data;
  const notes = notesQuery.data || candidate?.notes || [];
  const transitions = candidate?.allowedTransitions || [];

  useDocumentTitle(candidate?.name ? `${candidate.name} candidate review` : 'Candidate review');

  const statusMutation = useMutation({
    mutationFn: ({ status, reason }) => recruiterService.updateCandidateStatus(applicationId, status, reason),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.recruiterApplication(applicationId), updated);
      void queryClient.invalidateQueries({ queryKey: ['job-applicants', updated.jobId] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.recruiterDashboard() });
      setNextStatus('');
      setStatusReason('');
      showToast(`${updated.name}'s application moved to ${updated.status}.`);
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Unable to update the application status.', { tone: 'error' }),
  });
  const addNoteMutation = useMutation({
    mutationFn: (body) => recruiterService.addPrivateNote(applicationId, body),
    onSuccess: (createdNote) => {
      queryClient.setQueryData(queryKeys.recruiterNotes(applicationId), (current = []) => [...current, createdNote]);
      setNote('');
      showToast('Private recruiter note saved.');
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Unable to save the private note.', { tone: 'error' }),
  });
  const deleteNoteMutation = useMutation({
    mutationFn: (noteId) => recruiterService.deletePrivateNote(noteId),
    onSuccess: (_result, noteId) => {
      queryClient.setQueryData(queryKeys.recruiterNotes(applicationId), (current = []) => current.filter((item) => item.id !== noteId));
      showToast('Private note deleted.');
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Unable to delete the private note.', { tone: 'error' }),
  });

  if (candidateQuery.isLoading) {
    return <div aria-label="Loading candidate details"><Skeleton className="h-36" /><div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_350px]"><Skeleton className="h-[580px]" /><Skeleton className="h-[580px]" /></div></div>;
  }
  if (candidateQuery.isError || !candidate) {
    return <EmptyState title="Candidate could not be loaded" description="This application may no longer be available, or you may not have access to it." actionLabel="Try again" onAction={() => candidateQuery.refetch()} />;
  }

  function saveNote(event) {
    event.preventDefault();
    const body = note.trim();
    if (body.length < 2 || body.length > 2000) return;
    addNoteMutation.mutate(body);
  }

  function updateStatus(event) {
    event.preventDefault();
    if (!nextStatus) return;
    statusMutation.mutate({ status: nextStatus, reason: statusReason.trim() });
  }

  function deleteNote(noteId) {
    if (window.confirm('Delete this private recruiter note? This cannot be undone.')) deleteNoteMutation.mutate(noteId);
  }

  return (
    <div>
      <Link to={`/recruiter/jobs/${candidate.jobId}/applicants`} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--cb-text-secondary)] hover:text-[var(--cb-primary)]"><ArrowLeft className="size-4" />Back to candidate pipeline</Link>
      <header className="surface-card mt-5 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start"><Avatar name={candidate.name} size="lg" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2">{Number.isFinite(candidate.match) && <Badge variant="primary">{candidate.match}% job match</Badge>}<Badge variant={statusVariant(candidate.statusCode)}>{candidate.status}</Badge></div><h1 className="mt-3 font-heading text-3xl font-extrabold tracking-[-0.035em]">{candidate.name}</h1><p className="mt-1 text-sm font-semibold text-[var(--cb-text-secondary)]">{candidate.headline || 'Applicant'}</p><p className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--cb-text-muted)]"><span className="inline-flex items-center gap-1.5"><MapPin className="size-4" />{candidate.location || 'Location not provided'}</span><span className="inline-flex items-center gap-1.5"><BriefcaseBusiness className="size-4" />{candidate.experience || 'Experience not provided'}</span></p></div></div>
      </header>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
        <div className="grid gap-6">
          <section className="surface-card p-6 sm:p-8"><h2 className="font-heading text-xl font-bold">Professional summary</h2><p className="mt-3 text-sm leading-7 text-[var(--cb-text-secondary)]">{candidate.summary}</p>{candidate.coverNote && <div className="mt-5 border-t border-[var(--cb-divider)] pt-5"><h3 className="text-sm font-bold">Application note</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--cb-text-secondary)]">{candidate.coverNote}</p></div>}</section>
          <section className="surface-card p-6 sm:p-8"><h2 className="font-heading text-xl font-bold">Skills</h2>{candidate.skills?.length ? <div className="mt-4 flex flex-wrap gap-2">{candidate.skills.map((skill) => <Badge key={skill} variant="primary" className="min-h-8 px-3">{skill}</Badge>)}</div> : <p className="mt-3 text-sm text-[var(--cb-text-muted)]">No skills have been added to this profile.</p>}</section>
          <EducationSection records={candidate.education} />
          <ExperienceSection records={candidate.experienceRecords} />
          <ProjectSection records={candidate.projects} />
          {candidate.certifications?.length > 0 && <CertificationSection records={candidate.certifications} />}
          {candidate.screeningAnswers?.length > 0 && <ScreeningSection answers={candidate.screeningAnswers} />}
          <section className="surface-card p-6 sm:p-8"><div className="flex items-start gap-3"><span className="grid size-11 place-items-center rounded-xl bg-[var(--cb-primary-soft)] text-[var(--cb-primary)]"><FileText /></span><div className="min-w-0 flex-1"><h2 className="font-heading text-lg font-bold">Submitted resume</h2><p className="mt-1 truncate text-sm text-[var(--cb-text-secondary)]">{candidate.resume.name}{candidate.resume.fileSize ? ` · ${formatFileSize(candidate.resume.fileSize)}` : ''}</p><p className="mt-1 text-xs text-[var(--cb-text-muted)]">Uploaded {readableDate(candidate.resume.createdAt)} · Parsing {candidate.resume.parseStatus?.toLowerCase() || 'status unavailable'}</p><a href={candidate.resume.contentUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex h-[34px] items-center justify-center rounded-[10px] border border-[var(--cb-border)] bg-[var(--cb-surface)] px-3 text-sm font-semibold hover:bg-[var(--cb-bg-subtle)]">Open resume</a></div></div></section>
        </div>

        <aside className="grid gap-5 lg:sticky lg:top-24">
          <MatchSummary candidate={candidate} />
          <section className="surface-card p-6"><h2 className="font-heading text-lg font-extrabold">Application status</h2>{transitions.length > 0 ? <form className="mt-4 grid gap-3" onSubmit={updateStatus}><label htmlFor="candidate-status" className="text-sm font-bold">Move candidate to</label><select id="candidate-status" value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} className="h-10 w-full rounded-lg border bg-[var(--cb-surface)] px-3 text-sm outline-none focus:border-[var(--cb-primary)]"><option value="">Select next stage</option>{transitions.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select><Input value={statusReason} onChange={(event) => setStatusReason(event.target.value)} maxLength={500} placeholder="Reason (optional)" aria-label="Reason for status change" /><Button type="submit" disabled={!nextStatus || statusMutation.isPending}>{statusMutation.isPending ? 'Updating…' : 'Update status'}</Button></form> : <p className="mt-3 text-sm text-[var(--cb-text-muted)]">{candidate.status} is a final application state.</p>}{candidate.history?.length > 0 && <div className="mt-5 border-t border-[var(--cb-divider)] pt-4"><h3 className="flex items-center gap-2 text-xs font-bold text-[var(--cb-text-muted)]"><History className="size-4" />Status history</h3><ol className="mt-3 grid gap-3">{candidate.history.slice().reverse().map((entry) => <li key={entry.id} className="text-xs"><div className="flex items-start justify-between gap-3"><span className="font-semibold">{entry.status}</span><time className="text-[var(--cb-text-muted)]">{readableDate(entry.changedAt)}</time></div>{entry.reason && <p className="mt-1 leading-5 text-[var(--cb-text-muted)]">{entry.reason}</p>}</li>)}</ol></div>}</section>
          <section className="surface-card p-6"><h2 className="font-heading text-lg font-extrabold">Private recruiter notes</h2><form onSubmit={saveNote} className="mt-4"><TextArea value={note} onChange={(event) => setNote(event.target.value)} minLength={2} maxLength={2000} placeholder="Add job-relevant observations for your hiring team…" aria-label="Private recruiter note" /><div className="mt-2 flex justify-between text-[10px] text-[var(--cb-text-muted)]"><span>Visible only to your recruiting team</span><span>{note.length}/2000</span></div><Button type="submit" className="mt-3 w-full" disabled={note.trim().length < 2 || addNoteMutation.isPending}><Save />{addNoteMutation.isPending ? 'Saving…' : 'Save note'}</Button></form>{notesQuery.isError && <p className="mt-4 text-xs text-[var(--cb-danger)]">Private notes could not be refreshed.</p>}{notes.length > 0 && <div className="mt-5 grid gap-3 border-t border-[var(--cb-divider)] pt-4">{notes.slice().reverse().map((item) => <article key={item.id} className="rounded-lg bg-[var(--cb-bg-subtle)] p-3"><p className="whitespace-pre-wrap text-xs leading-5 text-[var(--cb-text-secondary)]">{item.note}</p><div className="mt-2 flex items-center justify-between gap-2"><span className="text-[10px] text-[var(--cb-text-muted)]">{item.author?.name || 'Recruiter'} · {readableDate(item.createdAt)}</span>{item.author?.id === sessionUserId && <Button type="button" variant="ghost" size="iconSm" aria-label="Delete private note" disabled={deleteNoteMutation.isPending} onClick={() => deleteNote(item.id)}><Trash2 /></Button>}</div></article>)}</div>}</section>
          <section className="flex gap-3 rounded-xl border border-[var(--cb-emerald)] bg-[var(--cb-emerald-soft)] p-4"><ShieldCheck className="size-5 shrink-0 text-[var(--cb-emerald)]" /><p className="text-xs leading-5 text-[var(--cb-text-secondary)]">Review candidates consistently against the published role. Do not use age, gender, religion, caste, photo, or other protected traits.</p></section>
          <Link to={`/jobs/${candidate.jobId}`} className="text-center text-xs font-bold text-[var(--cb-primary)] hover:underline">Review published job</Link>
        </aside>
      </div>
    </div>
  );
}

function EducationSection({ records = [] }) {
  return <section className="surface-card p-6 sm:p-8"><div className="flex items-center gap-3"><BookOpen className="text-[var(--cb-primary)]" /><h2 className="font-heading text-xl font-bold">Education</h2></div>{records.length ? <div className="mt-4 grid gap-4">{records.map((record) => <article key={record.id} className="rounded-xl bg-[var(--cb-bg-subtle)] p-4"><h3 className="text-sm font-bold">{record.qualification}{record.fieldOfStudy ? ` in ${record.fieldOfStudy}` : ''}</h3><p className="mt-1 text-xs text-[var(--cb-text-secondary)]">{record.institution}</p><p className="mt-2 text-xs text-[var(--cb-text-muted)]">{record.startYear || 'Start not provided'} – {record.isCurrent ? 'Present' : record.endYear || 'End not provided'}{record.grade ? ` · ${record.grade}` : ''}</p>{record.description && <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-[var(--cb-text-secondary)]">{record.description}</p>}</article>)}</div> : <p className="mt-4 text-sm text-[var(--cb-text-muted)]">No education records provided.</p>}</section>;
}

function ExperienceSection({ records = [] }) {
  return <section className="surface-card p-6 sm:p-8"><h2 className="font-heading text-xl font-bold">Experience</h2>{records.length ? <div className="mt-4 grid gap-4">{records.map((record) => <article key={record.id} className="rounded-xl bg-[var(--cb-bg-subtle)] p-4"><h3 className="text-sm font-bold">{record.title}</h3><p className="mt-1 text-xs text-[var(--cb-text-secondary)]">{record.organization}{record.location ? ` · ${record.location}` : ''}</p><p className="mt-2 text-xs text-[var(--cb-text-muted)]">{readableDate(record.startDate, { month: 'short' })} – {record.isCurrent ? 'Present' : readableDate(record.endDate, { month: 'short' })}{record.employmentType ? ` · ${record.employmentType}` : ''}</p>{record.description && <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-[var(--cb-text-secondary)]">{record.description}</p>}</article>)}</div> : <p className="mt-4 text-sm text-[var(--cb-text-muted)]">No experience records provided.</p>}</section>;
}

function ProjectSection({ records = [] }) {
  return <section className="surface-card p-6 sm:p-8"><h2 className="font-heading text-xl font-bold">Projects and evidence</h2>{records.length ? <div className="mt-4 grid gap-3">{records.map((project) => <article key={project.id} className="rounded-xl bg-[var(--cb-bg-subtle)] p-4"><h3 className="text-sm font-bold">{project.name}</h3>{project.description && <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-[var(--cb-text-secondary)]">{project.description}</p>}{project.technologies?.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{project.technologies.map((technology) => <Badge key={technology}>{technology}</Badge>)}</div>}<div className="mt-3 flex gap-4">{project.projectUrl && <a className="text-xs font-bold text-[var(--cb-primary)] hover:underline" href={project.projectUrl} target="_blank" rel="noreferrer">View project</a>}{project.repositoryUrl && <a className="text-xs font-bold text-[var(--cb-primary)] hover:underline" href={project.repositoryUrl} target="_blank" rel="noreferrer">View repository</a>}</div></article>)}</div> : <p className="mt-4 text-sm text-[var(--cb-text-muted)]">No projects provided.</p>}</section>;
}

function CertificationSection({ records }) {
  return <section className="surface-card p-6 sm:p-8"><h2 className="font-heading text-xl font-bold">Certifications</h2><div className="mt-4 grid gap-3">{records.map((certification) => <article key={certification.id} className="rounded-xl bg-[var(--cb-bg-subtle)] p-4"><h3 className="text-sm font-bold">{certification.name}</h3><p className="mt-1 text-xs text-[var(--cb-text-secondary)]">{certification.issuer}{certification.issuedAt ? ` · ${readableDate(certification.issuedAt, { month: 'short' })}` : ''}</p>{certification.credentialUrl && <a className="mt-3 inline-block text-xs font-bold text-[var(--cb-primary)] hover:underline" href={certification.credentialUrl} target="_blank" rel="noreferrer">Verify credential</a>}</article>)}</div></section>;
}

function ScreeningSection({ answers }) {
  return <section className="surface-card p-6 sm:p-8"><h2 className="font-heading text-xl font-bold">Screening responses</h2><dl className="mt-4 grid gap-4">{answers.map((answer) => <div key={answer.id || answer.questionId} className="rounded-xl bg-[var(--cb-bg-subtle)] p-4"><dt className="text-xs font-bold text-[var(--cb-text-muted)]">{answer.questionSnapshot || 'Screening question'}</dt><dd className="mt-2 whitespace-pre-wrap text-sm text-[var(--cb-text-secondary)]">{answer.answer}</dd></div>)}</dl></section>;
}

function MatchSummary({ candidate }) {
  return <section className="surface-card p-6"><h2 className="font-heading text-lg font-extrabold">Match summary</h2>{Number.isFinite(candidate.match) ? <><div className="mt-4 flex items-end justify-between"><span className="font-heading text-3xl font-extrabold text-[var(--cb-emerald)]">{candidate.match}%</span><span className="text-xs text-[var(--cb-text-muted)]">Guidance signal</span></div><ProgressBar value={candidate.match} className="mt-3" /></> : <p className="mt-3 text-sm text-[var(--cb-text-muted)]">A match score is not available yet.</p>}<dl className="mt-5 grid gap-3 text-xs"><div className="flex justify-between gap-3"><dt className="text-[var(--cb-text-muted)]">Required skills</dt><dd className="font-bold">{candidate.requiredCoverage}</dd></div><div className="flex justify-between gap-3"><dt className="text-[var(--cb-text-muted)]">Preferred skills</dt><dd className="font-bold">{candidate.preferredCoverage}</dd></div><div className="flex justify-between gap-3"><dt className="text-[var(--cb-text-muted)]">Experience evidence</dt><dd className="text-right font-bold">{Number.isFinite(candidate.matchDetails?.experienceScore) ? `${candidate.matchDetails.experienceScore}%` : 'Unavailable'}</dd></div></dl>{candidate.missing?.length > 0 && <div className="mt-5 border-t border-[var(--cb-divider)] pt-4"><p className="text-xs font-bold text-[var(--cb-text-muted)]">Missing or unconfirmed</p><div className="mt-2 flex flex-wrap gap-1.5">{candidate.missing.map((item) => <Badge key={item} variant="warning">{item}</Badge>)}</div></div>}<p className="mt-5 text-[10px] leading-4 text-[var(--cb-text-muted)]">This explainable score uses job-relevant evidence only. It does not assess protected or sensitive attributes and must not replace human review.</p></section>;
}
