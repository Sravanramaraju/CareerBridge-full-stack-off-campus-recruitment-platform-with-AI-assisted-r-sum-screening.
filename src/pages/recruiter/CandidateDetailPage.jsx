import { useState } from 'react';
import { ArrowLeft, BookOpen, BriefcaseBusiness, FileText, MapPin, Save, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Avatar } from '@/src/components/ui/Avatar';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { EmptyState, ProgressBar } from '@/src/components/ui/Feedback';
import { TextArea } from '@/src/components/ui/Input';
import { jobs, recruiterCandidates } from '@/src/data/mockData';
import { useAppStore } from '@/src/store/useAppStore';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';

const statusOptions = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Offered', 'Rejected'];

export function CandidateDetailPage() {
  const { applicationId } = useParams();
  const candidate = recruiterCandidates.find((item) => item.applicationId === applicationId);
  useDocumentTitle(candidate?.name ? `${candidate.name} candidate review` : 'Candidate not found');
  const statuses = useAppStore((state) => state.candidateStatuses);
  const updateCandidateStatus = useAppStore((state) => state.updateCandidateStatus);
  const notes = useAppStore((state) => state.recruiterNotes[applicationId] || []);
  const addRecruiterNote = useAppStore((state) => state.addRecruiterNote);
  const [note, setNote] = useState('');
  if (!candidate) return <EmptyState title="Candidate not found" description="This application may no longer be available in the demo pipeline." />;
  const job = jobs.find((item) => item.id === candidate.jobId);
  const currentStatus = statuses[candidate.applicationId] || candidate.status;

  function saveNote(event) {
    event.preventDefault();
    if (!note.trim()) return;
    addRecruiterNote(candidate.applicationId, note.trim());
    setNote('');
  }

  return (
    <div>
      <Link to={`/recruiter/jobs/${candidate.jobId}/applicants`} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--cb-text-secondary)] hover:text-[var(--cb-primary)]"><ArrowLeft className="size-4" />Back to candidate pipeline</Link>
      <header className="surface-card mt-5 p-6 sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-start"><Avatar name={candidate.name} size="lg" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Badge variant="primary">{candidate.match}% job match</Badge><Badge variant={currentStatus === 'Rejected' ? 'danger' : currentStatus === 'Interview' || currentStatus === 'Offered' ? 'success' : 'neutral'}>{currentStatus}</Badge></div><h1 className="mt-3 font-heading text-3xl font-extrabold tracking-[-0.035em]">{candidate.name}</h1><p className="mt-1 text-sm font-semibold text-[var(--cb-text-secondary)]">{candidate.headline}</p><p className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--cb-text-muted)]"><span className="inline-flex items-center gap-1.5"><MapPin className="size-4" />{candidate.location}</span><span className="inline-flex items-center gap-1.5"><BriefcaseBusiness className="size-4" />{candidate.experience}</span></p></div></div></header>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
        <div className="grid gap-6">
          <section className="surface-card p-6 sm:p-8"><h2 className="font-heading text-xl font-bold">Professional summary</h2><p className="mt-3 text-sm leading-7 text-[var(--cb-text-secondary)]">{candidate.summary}</p></section>
          <section className="surface-card p-6 sm:p-8"><h2 className="font-heading text-xl font-bold">Skills</h2><div className="mt-4 flex flex-wrap gap-2">{candidate.skills.map((skill) => <Badge key={skill} variant="primary" className="min-h-8 px-3">{skill}</Badge>)}</div></section>
          <section className="surface-card p-6 sm:p-8"><div className="flex items-center gap-3"><BookOpen className="text-[var(--cb-primary)]" /><h2 className="font-heading text-xl font-bold">Education</h2></div><p className="mt-4 text-sm font-semibold">{candidate.education}</p></section>
          <section className="surface-card p-6 sm:p-8"><h2 className="font-heading text-xl font-bold">Projects and evidence</h2><div className="mt-4 grid gap-3">{candidate.projects.map((project) => <article key={project} className="rounded-xl bg-[var(--cb-bg-subtle)] p-4"><h3 className="text-sm font-bold">{project}</h3><p className="mt-1 text-xs leading-5 text-[var(--cb-text-secondary)]">Candidate-submitted project evidence. Review the resume and discussion notes for context.</p></article>)}</div></section>
          <section className="surface-card p-6 sm:p-8"><div className="flex items-start gap-3"><span className="grid size-11 place-items-center rounded-xl bg-[var(--cb-primary-soft)] text-[var(--cb-primary)]"><FileText /></span><div className="flex-1"><h2 className="font-heading text-lg font-bold">Submitted resume</h2><p className="mt-1 text-sm text-[var(--cb-text-secondary)]">{candidate.name.replaceAll(' ', '_')}_Resume.pdf · Demo document</p><Button variant="secondary" size="sm" className="mt-4" disabled>Preview unavailable in demo</Button></div></div></section>
        </div>

        <aside className="grid gap-5 lg:sticky lg:top-24">
          <section className="surface-card p-6"><h2 className="font-heading text-lg font-extrabold">Match summary</h2><div className="mt-4 flex items-end justify-between"><span className="font-heading text-3xl font-extrabold text-[var(--cb-emerald)]">{candidate.match}%</span><span className="text-xs text-[var(--cb-text-muted)]">Guidance signal</span></div><ProgressBar value={candidate.match} className="mt-3" /><dl className="mt-5 grid gap-3 text-xs"><div className="flex justify-between"><dt className="text-[var(--cb-text-muted)]">Required skills</dt><dd className="font-bold">{candidate.requiredCoverage}</dd></div><div className="flex justify-between"><dt className="text-[var(--cb-text-muted)]">Preferred skills</dt><dd className="font-bold">{candidate.preferredCoverage}</dd></div><div className="flex justify-between"><dt className="text-[var(--cb-text-muted)]">Experience</dt><dd className="font-bold text-[var(--cb-emerald)]">Matched</dd></div><div className="flex justify-between"><dt className="text-[var(--cb-text-muted)]">Location / mode</dt><dd className="font-bold text-[var(--cb-emerald)]">Matched</dd></div></dl>{candidate.missing.length > 0 && <div className="mt-5 border-t border-[var(--cb-divider)] pt-4"><p className="text-xs font-bold text-[var(--cb-text-muted)]">Missing or unconfirmed</p><div className="mt-2 flex flex-wrap gap-1.5">{candidate.missing.map((item) => <Badge key={item} variant="warning">{item}</Badge>)}</div></div>}<p className="mt-5 text-[10px] leading-4 text-[var(--cb-text-muted)]">This mock score uses job-relevant evidence only. It does not assess protected or sensitive attributes and must not replace human review.</p></section>
          <section className="surface-card p-6"><label htmlFor="candidate-status" className="text-sm font-bold">Application status</label><select id="candidate-status" value={currentStatus} onChange={(event) => updateCandidateStatus(candidate.applicationId, event.target.value)} className="mt-2 h-10 w-full rounded-lg border bg-[var(--cb-surface)] px-3 text-sm outline-none focus:border-[var(--cb-primary)]">{statusOptions.map((status) => <option key={status}>{status}</option>)}</select><p className="mt-2 text-[10px] leading-4 text-[var(--cb-text-muted)]">Changes update the local demo pipeline immediately.</p></section>
          <section className="surface-card p-6"><h2 className="font-heading text-lg font-extrabold">Private recruiter notes</h2><form onSubmit={saveNote} className="mt-4"><TextArea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add job-relevant observations for your hiring team…" aria-label="Private recruiter note" /><Button type="submit" className="mt-3 w-full" disabled={!note.trim()}><Save />Save note</Button></form>{notes.length > 0 && <div className="mt-5 grid gap-3 border-t border-[var(--cb-divider)] pt-4">{notes.slice().reverse().map((item) => <p key={item.id} className="rounded-lg bg-[var(--cb-bg-subtle)] p-3 text-xs leading-5 text-[var(--cb-text-secondary)]">{item.note}</p>)}</div>}</section>
          <section className="flex gap-3 rounded-xl border border-[var(--cb-emerald)] bg-[var(--cb-emerald-soft)] p-4"><ShieldCheck className="size-5 shrink-0 text-[var(--cb-emerald)]" /><p className="text-xs leading-5 text-[var(--cb-text-secondary)]">Review candidates consistently against the published role. Do not use age, gender, religion, caste, photo, or other protected traits.</p></section>
          <Link to={`/jobs/${job.id}`} className="text-center text-xs font-bold text-[var(--cb-primary)] hover:underline">Review published job</Link>
        </aside>
      </div>
    </div>
  );
}
