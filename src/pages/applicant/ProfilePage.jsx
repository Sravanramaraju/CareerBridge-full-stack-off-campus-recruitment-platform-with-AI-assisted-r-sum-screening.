import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, FileSearch, FileText, MapPin, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { Avatar } from '@/src/components/ui/Avatar';
import { ProfileRecordModal } from '@/src/components/profile/ProfileRecordModal';
import { ResumeReviewModal } from '@/src/components/profile/ResumeReviewModal';
import { Badge } from '@/src/components/ui/Badge';
import { Button, buttonVariants } from '@/src/components/ui/Button';
import { EmptyState, ProgressBar, Skeleton } from '@/src/components/ui/Feedback';
import { Input, TextArea } from '@/src/components/ui/Input';
import { Modal, ModalContent } from '@/src/components/ui/Modal';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';
import { useToast } from '@/src/components/feedback/ToastProvider';
import { profilesService } from '@/src/services/profilesService';
import { queryKeys } from '@/src/services/queryKeys';
import { resumesService } from '@/src/services/resumesService';

function ProfileSection({ title, description, action, children }) {
  return (
    <section className="surface-card p-6">
      <header className="flex items-start justify-between gap-4"><div><h2 className="font-heading text-lg font-bold">{title}</h2>{description && <p className="mt-1 text-xs leading-5 text-[var(--cb-text-muted)]">{description}</p>}</div>{action}</header>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function ProfilePage() {
  useDocumentTitle('My profile');
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [basicOpen, setBasicOpen] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [recordEditor, setRecordEditor] = useState(null);
  const [reviewResume, setReviewResume] = useState(null);
  const [deleteResumeTarget, setDeleteResumeTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [basicForm, setBasicForm] = useState({ name: '', headline: '', location: '', summary: '', locations: '', jobTypes: '', workModes: '' });
  const fileInputRef = useRef(null);
  const profileQuery = useQuery({
    queryKey: queryKeys.applicantProfile(),
    queryFn: ({ signal }) => profilesService.getApplicantProfile({ signal }),
  });
  const resumesQuery = useQuery({
    queryKey: queryKeys.applicantResumes(),
    queryFn: ({ signal }) => resumesService.getResumes({ signal }),
  });
  const profile = profileQuery.data;
  const resumes = resumesQuery.data || [];
  const profileMutation = useMutation({
    mutationFn: (updates) => profilesService.updateApplicantProfile(updates),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.applicantProfile(), updated);
      setBasicOpen(false);
      showToast('Profile updated.');
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Unable to update profile.', { tone: 'error' }),
  });
  const skillsMutation = useMutation({
    mutationFn: (skillRecords) => profilesService.replaceSkills(skillRecords),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.applicantProfile(), (current) => ({ ...current, ...updated }));
      setSkillInput('');
      showToast('Skills updated.');
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Unable to update skills.', { tone: 'error' }),
  });
  const resumeMutation = useMutation({
    mutationFn: ({ action, file, resumeId }) => {
      if (action === 'upload') return resumesService.uploadResume(file);
      if (action === 'primary') return resumesService.setPrimaryResume(resumeId);
      return resumesService.deleteResume(resumeId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.applicantResumes() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.applicantProfile() });
      setDeleteResumeTarget(null);
      showToast('Résumé library updated.');
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Unable to update résumés.', { tone: 'error' }),
  });
  const recordMutation = useMutation({
    mutationFn: ({ type, record, values }) => record
      ? profilesService[type].update(record.id, values)
      : profilesService[type].create(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.applicantProfile() });
      setRecordEditor(null);
      showToast('Profile record saved.');
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Unable to save this record.', { tone: 'error' }),
  });
  const deleteRecordMutation = useMutation({
    mutationFn: ({ type, record }) => profilesService[type].remove(record.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.applicantProfile() });
      setDeleteTarget(null);
      showToast('Profile record deleted.');
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Unable to delete this record.', { tone: 'error' }),
  });

  if (profileQuery.isLoading) return <div aria-label="Loading profile"><Skeleton className="h-24" /><Skeleton className="mt-6 h-52" /><Skeleton className="mt-6 h-52" /></div>;
  if (profileQuery.isError || !profile) return <EmptyState icon={FileSearch} title="Profile could not be loaded" description="Please try again in a moment." actionLabel="Try again" onAction={() => profileQuery.refetch()} />;

  const skills = profile.skills || [];
  const skillRecords = profile.skillRecords || skills.map((name) => ({ name }));
  const education = profile.education || [];
  const projects = profile.projects || [];
  const experience = profile.experience || [];
  const certifications = profile.certificationRecords || [];
  const preferences = profile.preferences || { locations: ['Bengaluru', 'Remote'], jobTypes: ['Full-time'], workModes: ['Hybrid'] };

  function openBasicEditor() {
    setBasicForm({
      name: profile.name || '',
      headline: profile.headline || '',
      location: profile.location || '',
      summary: profile.summary || '',
      locations: preferences.locations.join(', '),
      jobTypes: preferences.jobTypes.join(', '),
      workModes: preferences.workModes.join(', '),
    });
    setBasicOpen(true);
  }

  function saveBasic(event) {
    event.preventDefault();
    const toList = (value) => value.split(',').map((item) => item.trim()).filter(Boolean);
    profileMutation.mutate({
      name: basicForm.name,
      headline: basicForm.headline || null,
      location: basicForm.location || null,
      summary: basicForm.summary || null,
      preferences: {
        locations: toList(basicForm.locations),
        jobTypes: toList(basicForm.jobTypes),
        workModes: toList(basicForm.workModes),
      },
    });
  }

  function addSkill(event) {
    event.preventDefault();
    const nextSkill = skillInput.trim();
    if (nextSkill && !skills.some((skill) => skill.toLocaleLowerCase() === nextSkill.toLocaleLowerCase())) {
      skillsMutation.mutate([...skillRecords, { name: nextSkill }]);
    }
  }

  function handleResume(event) {
    const file = event.target.files?.[0];
    if (file) resumeMutation.mutate({ action: 'upload', file });
    event.target.value = '';
  }

  function createRecordFromResume(type, initialValues) {
    setReviewResume(null);
    setRecordEditor({ type, initialValues });
  }

  return (
    <div>
      <header><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--cb-primary)]">Professional profile</p><h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Make your evidence easy to understand</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--cb-text-secondary)]">Keep your skills, projects, preferences, and resume current so recommendations have useful context.</p></header>
      <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-5">
          <section className="surface-card p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start"><Avatar name={profile.name} size="lg" /><div className="min-w-0 flex-1"><h2 className="font-heading text-2xl font-extrabold">{profile.name}</h2><p className="mt-1 text-sm font-medium text-[var(--cb-text-secondary)]">{profile.headline}</p><p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--cb-text-muted)]"><MapPin className="size-4" />{profile.location} · {profile.email || 'applicant@careerbridge.demo'}</p></div><Button variant="secondary" size="sm" onClick={openBasicEditor}><Pencil />Edit basic info</Button></div>
          </section>

          <ProfileSection title="Professional summary" action={<Button variant="ghost" size="sm" onClick={openBasicEditor}><Pencil />Edit</Button>}><p className="text-sm leading-7 text-[var(--cb-text-secondary)]">{profile.summary || 'Add a concise summary of the work you want to do and the evidence you bring.'}</p></ProfileSection>

          <ProfileSection title="Skills" description="Use skills you can support with coursework, projects, or experience.">
            <div className="flex flex-wrap gap-2">{skills.map((skill) => <button key={skill} type="button" disabled={skillsMutation.isPending} onClick={() => skillsMutation.mutate(skillRecords.filter((item) => item.name !== skill))} title={`Remove ${skill}`}><Badge variant="primary" className="min-h-8 px-3">{skill} <span aria-hidden="true">×</span></Badge></button>)}</div>
            <form onSubmit={addSkill} className="mt-4 flex gap-2"><Input value={skillInput} onChange={(event) => setSkillInput(event.target.value)} placeholder="Add a skill" aria-label="Add a skill" /><Button type="submit" variant="secondary" disabled={skillsMutation.isPending}><Plus />Add</Button></form>
          </ProfileSection>

          <ProfileSection title="Education" action={<Button variant="ghost" size="sm" onClick={() => setRecordEditor({ type: 'education' })}><Plus />Add</Button>}>
            {education.length === 0 && <p className="text-sm text-[var(--cb-text-muted)]">Add your current or completed education.</p>}
            <div className="grid gap-4">{education.map((item) => <article key={item.id} className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold">{item.qualification}</h3><p className="mt-1 text-sm text-[var(--cb-text-secondary)]">{item.institution}</p><p className="mt-1 text-xs text-[var(--cb-text-muted)]">{item.period}</p></div><div className="flex"><Button variant="ghost" size="iconSm" onClick={() => setRecordEditor({ type: 'education', record: item })} aria-label={`Edit ${item.qualification}`}><Pencil /></Button><Button variant="ghost" size="iconSm" onClick={() => setDeleteTarget({ type: 'education', record: item, label: item.qualification })} aria-label={`Delete ${item.qualification}`}><Trash2 /></Button></div></article>)}</div>
          </ProfileSection>

          <ProfileSection title="Projects" action={<Button variant="ghost" size="sm" onClick={() => setRecordEditor({ type: 'projects' })}><Plus />Add project</Button>}>
            {projects.length === 0 && <p className="text-sm text-[var(--cb-text-muted)]">Add projects that demonstrate relevant outcomes and skills.</p>}
            <div className="grid gap-4">{projects.map((project) => <article key={project.id} className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold">{project.name}</h3><p className="mt-2 text-sm leading-6 text-[var(--cb-text-secondary)]">{project.description}</p>{project.technologies?.length > 0 && <p className="mt-2 text-xs text-[var(--cb-text-muted)]">{project.technologies.join(' · ')}</p>}</div><div className="flex"><Button variant="ghost" size="iconSm" onClick={() => setRecordEditor({ type: 'projects', record: project })} aria-label={`Edit ${project.name}`}><Pencil /></Button><Button variant="ghost" size="iconSm" onClick={() => setDeleteTarget({ type: 'projects', record: project, label: project.name })} aria-label={`Delete ${project.name}`}><Trash2 /></Button></div></article>)}</div>
          </ProfileSection>

          <ProfileSection title="Experience" action={<Button variant="ghost" size="sm" onClick={() => setRecordEditor({ type: 'experience' })}><Plus />Add experience</Button>}>
            {experience.length === 0 && <div className="rounded-xl border border-dashed p-5 text-center"><p className="text-sm font-semibold">No formal experience added</p><p className="mt-1 text-xs text-[var(--cb-text-muted)]">Internships, volunteering, freelance work, and campus responsibilities all count when relevant.</p></div>}
            <div className="grid gap-4">{experience.map((item) => <article key={item.id} className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold">{item.title}</h3><p className="mt-1 text-sm text-[var(--cb-text-secondary)]">{item.organization}{item.employmentType ? ` · ${item.employmentType}` : ''}</p><p className="mt-1 text-xs text-[var(--cb-text-muted)]">{item.startDate ? new Date(item.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Start date not specified'} – {item.isCurrent ? 'Present' : item.endDate ? new Date(item.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Not specified'}</p></div><div className="flex"><Button variant="ghost" size="iconSm" onClick={() => setRecordEditor({ type: 'experience', record: item })} aria-label={`Edit ${item.title}`}><Pencil /></Button><Button variant="ghost" size="iconSm" onClick={() => setDeleteTarget({ type: 'experience', record: item, label: item.title })} aria-label={`Delete ${item.title}`}><Trash2 /></Button></div></article>)}</div>
          </ProfileSection>

          <ProfileSection title="Certifications" action={<Button variant="ghost" size="sm" onClick={() => setRecordEditor({ type: 'certifications' })}><Plus />Add certification</Button>}>
            {certifications.length === 0 && <p className="text-sm text-[var(--cb-text-muted)]">Add relevant certifications and credentials.</p>}
            <ul className="grid gap-2">{certifications.map((certification) => <li key={certification.id} className="flex items-center gap-2 text-sm text-[var(--cb-text-secondary)]"><span className="size-2 rounded-full bg-[var(--cb-emerald)]" /><span className="flex-1">{certification.name} · {certification.issuer}</span><Button variant="ghost" size="iconSm" onClick={() => setRecordEditor({ type: 'certifications', record: certification })} aria-label={`Edit ${certification.name}`}><Pencil /></Button><Button variant="ghost" size="iconSm" onClick={() => setDeleteTarget({ type: 'certifications', record: certification, label: certification.name })} aria-label={`Delete ${certification.name}`}><Trash2 /></Button></li>)}</ul>
          </ProfileSection>

          <ProfileSection title="Résumés" description="Upload PDF or DOCX files. CareerBridge extracts job-relevant profile evidence after upload.">
            {resumesQuery.isLoading && <Skeleton className="h-20" />}
            {resumes.map((resume) => <div key={resume.id} className="mb-3 flex flex-col gap-4 rounded-xl bg-[var(--cb-bg-subtle)] p-4 last:mb-0 sm:flex-row sm:items-center"><span className="grid size-11 place-items-center rounded-xl bg-[var(--cb-primary-soft)] text-[var(--cb-primary)]"><FileText /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{resume.originalFileName}</p><p className="mt-1 text-xs text-[var(--cb-text-muted)]">{resume.isPrimary ? 'Primary résumé' : 'Résumé'} · {resume.parseStatus.toLocaleLowerCase()} · {Math.ceil(resume.fileSize / 1024)} KB</p>{resume.parseStatus === 'FAILED' && resume.parseError && <p className="mt-1 text-xs text-[var(--cb-danger)]">{resume.parseError}</p>}</div><div className="flex flex-wrap gap-2"><a href={resumesService.contentUrl(resume.id)} target="_blank" rel="noreferrer" className={buttonVariants({ variant: 'secondary', size: 'sm' })}><ExternalLink />Open</a>{resume.parseStatus === 'READY' && <Button variant="soft" size="sm" onClick={() => setReviewResume(resume)}>Review extraction</Button>}{!resume.isPrimary && <Button variant="secondary" size="sm" disabled={resumeMutation.isPending} onClick={() => resumeMutation.mutate({ action: 'primary', resumeId: resume.id })}>Set primary</Button>}<Button variant="dangerSoft" size="iconSm" disabled={resumeMutation.isPending} onClick={() => setDeleteResumeTarget(resume)} aria-label={`Delete ${resume.originalFileName}`}><Trash2 /></Button></div></div>)}
            {resumesQuery.isSuccess && resumes.length === 0 && <div className="rounded-xl border border-dashed p-5 text-center"><p className="text-sm font-semibold">No résumé uploaded</p><p className="mt-1 text-xs text-[var(--cb-text-muted)]">Add one before applying to an opportunity.</p></div>}
            <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="sr-only" onChange={handleResume} />
            <Button variant="soft" className="mt-4" onClick={() => fileInputRef.current?.click()} disabled={resumeMutation.isPending}><Upload />{resumeMutation.isPending ? 'Uploading…' : 'Upload résumé'}</Button>
          </ProfileSection>

          <ProfileSection title="Preferences" action={<Button variant="ghost" size="sm" onClick={openBasicEditor}><Pencil />Edit</Button>}>
            <div className="grid gap-4 sm:grid-cols-3">{[['Preferred locations', preferences.locations], ['Job types', preferences.jobTypes], ['Work modes', preferences.workModes]].map(([label, values]) => <div key={label}><p className="text-xs font-bold text-[var(--cb-text-muted)]">{label}</p><div className="mt-2 flex flex-wrap gap-1.5">{values.map((value) => <Badge key={value}>{value}</Badge>)}</div></div>)}</div>
          </ProfileSection>
        </div>

        <aside className="grid gap-5 lg:sticky lg:top-24">
          <section className="surface-card p-6"><p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--cb-primary)]">Profile completion</p><h2 className="mt-2 font-heading text-2xl font-extrabold">{profile.profileCompletion || 78}%</h2><ProgressBar className="mt-4" value={profile.profileCompletion || 78} /><ul className="mt-5 grid gap-3 text-xs text-[var(--cb-text-secondary)]">{['Basic details complete', 'Resume added', 'Add recent project outcomes', 'Add one experience example'].map((item, index) => <li key={item} className="flex gap-2"><span className={`mt-0.5 grid size-4 place-items-center rounded-full text-[10px] ${index < 2 ? 'bg-[var(--cb-emerald)] text-white' : 'border border-[var(--cb-border-strong)]'}`}>{index < 2 ? '✓' : ''}</span>{item}</li>)}</ul></section>
          <section className="rounded-2xl border border-[var(--cb-cyan)] bg-[var(--cb-cyan-soft)] p-5"><FileSearch className="text-[var(--cb-cyan-strong)]" /><h2 className="mt-3 font-heading text-base font-bold">Résumé parsing status</h2><p className="mt-2 text-xs leading-5 text-[var(--cb-text-secondary)]">Uploaded documents are parsed on the server and used only for explainable, job-relevant matching signals.</p></section>
        </aside>
      </div>

      <Modal open={basicOpen} onOpenChange={setBasicOpen}><ModalContent title="Edit profile and preferences" description="Keep this concise and aligned with the roles you want."><form onSubmit={saveBasic} className="grid max-h-[70vh] gap-4 overflow-y-auto pr-1"><label htmlFor="profile-name" className="grid gap-1.5 text-sm font-semibold">Full name<Input id="profile-name" required value={basicForm.name} onChange={(event) => setBasicForm({ ...basicForm, name: event.target.value })} /></label><label htmlFor="profile-headline" className="grid gap-1.5 text-sm font-semibold">Professional headline<TextArea id="profile-headline" className="min-h-20" maxLength={160} value={basicForm.headline} onChange={(event) => setBasicForm({ ...basicForm, headline: event.target.value })} /></label><label htmlFor="profile-location" className="grid gap-1.5 text-sm font-semibold">Location<Input id="profile-location" value={basicForm.location} onChange={(event) => setBasicForm({ ...basicForm, location: event.target.value })} /></label><label htmlFor="profile-summary" className="grid gap-1.5 text-sm font-semibold">Professional summary<TextArea id="profile-summary" maxLength={1500} value={basicForm.summary} onChange={(event) => setBasicForm({ ...basicForm, summary: event.target.value })} /></label>{[['locations', 'Preferred locations'], ['jobTypes', 'Job types'], ['workModes', 'Work modes']].map(([key, label]) => <label key={key} htmlFor={`profile-${key}`} className="grid gap-1.5 text-sm font-semibold">{label}<Input id={`profile-${key}`} value={basicForm[key]} onChange={(event) => setBasicForm({ ...basicForm, [key]: event.target.value })} placeholder="Comma-separated" /></label>)}<div className="flex justify-end"><Button type="submit" disabled={profileMutation.isPending}>{profileMutation.isPending ? 'Saving…' : 'Save changes'}</Button></div></form></ModalContent></Modal>
      {recordEditor && <ProfileRecordModal key={`${recordEditor.type}-${recordEditor.record?.id || 'new'}`} editor={recordEditor} pending={recordMutation.isPending} onClose={() => setRecordEditor(null)} onSave={(values) => recordMutation.mutate({ ...recordEditor, values })} />}
      {reviewResume && <ResumeReviewModal resume={reviewResume} existingSkills={skills} pending={skillsMutation.isPending} onClose={() => setReviewResume(null)} onApplySkills={(records) => skillsMutation.mutate(records, { onSuccess: () => setReviewResume(null) })} onCreateRecord={createRecordFromResume} />}
      <Modal open={Boolean(deleteResumeTarget)} onOpenChange={(open) => !open && setDeleteResumeTarget(null)}><ModalContent title={`Delete ${deleteResumeTarget?.originalFileName || 'résumé'}?`} description="The file will leave your active résumé library. Existing applications retain their historical reference."><div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setDeleteResumeTarget(null)}>Cancel</Button><Button variant="danger" disabled={resumeMutation.isPending} onClick={() => resumeMutation.mutate({ action: 'delete', resumeId: deleteResumeTarget.id })}>{resumeMutation.isPending ? 'Deleting…' : 'Delete résumé'}</Button></div></ModalContent></Modal>
      <Modal open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}><ModalContent title={`Delete ${deleteTarget?.label || 'profile record'}?`} description="This removes the record from your CareerBridge profile and may affect future match guidance."><div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button><Button variant="danger" disabled={deleteRecordMutation.isPending} onClick={() => deleteRecordMutation.mutate(deleteTarget)}>{deleteRecordMutation.isPending ? 'Deleting…' : 'Delete'}</Button></div></ModalContent></Modal>
    </div>
  );
}
