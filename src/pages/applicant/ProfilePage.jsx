import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileSearch, FileText, MapPin, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { Avatar } from '@/src/components/ui/Avatar';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
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
      showToast('Résumé library updated.');
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Unable to update résumés.', { tone: 'error' }),
  });

  if (profileQuery.isLoading) return <div aria-label="Loading profile"><Skeleton className="h-24" /><Skeleton className="mt-6 h-52" /><Skeleton className="mt-6 h-52" /></div>;
  if (profileQuery.isError || !profile) return <EmptyState icon={FileSearch} title="Profile could not be loaded" description="Please try again in a moment." actionLabel="Try again" onAction={() => profileQuery.refetch()} />;

  const skills = profile.skills || [];
  const skillRecords = profile.skillRecords || skills.map((name) => ({ name }));
  const education = profile.education || [{ institution: 'Visvesvaraya Technological University', qualification: 'B.E. in Computer Science', period: '2022–2026' }];
  const projects = profile.projects || [{ name: 'Campus Opportunity Tracker', description: 'A responsive placement and application tracking dashboard.' }];
  const certifications = profile.certifications || ['Responsive Web Design · freeCodeCamp'];
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

          <ProfileSection title="Education" action={<Button variant="ghost" size="sm"><Pencil />Edit</Button>}>
            {education.map((item) => <div key={item.qualification}><h3 className="text-sm font-bold">{item.qualification}</h3><p className="mt-1 text-sm text-[var(--cb-text-secondary)]">{item.institution}</p><p className="mt-1 text-xs text-[var(--cb-text-muted)]">{item.period}</p></div>)}
          </ProfileSection>

          <ProfileSection title="Projects" action={<Button variant="ghost" size="sm"><Plus />Add project</Button>}>
            {projects.map((project) => <article key={project.name}><h3 className="text-sm font-bold">{project.name}</h3><p className="mt-2 text-sm leading-6 text-[var(--cb-text-secondary)]">{project.description}</p></article>)}
          </ProfileSection>

          <ProfileSection title="Experience" action={<Button variant="ghost" size="sm"><Plus />Add experience</Button>}>
            <div className="rounded-xl border border-dashed p-5 text-center"><p className="text-sm font-semibold">No formal experience added</p><p className="mt-1 text-xs text-[var(--cb-text-muted)]">Internships, volunteering, freelance work, and campus responsibilities all count when relevant.</p></div>
          </ProfileSection>

          <ProfileSection title="Certifications" action={<Button variant="ghost" size="sm"><Plus />Add certification</Button>}>
            <ul className="grid gap-2">{certifications.map((certification) => <li key={certification} className="flex items-center gap-2 text-sm text-[var(--cb-text-secondary)]"><span className="size-2 rounded-full bg-[var(--cb-emerald)]" />{certification}</li>)}</ul>
          </ProfileSection>

          <ProfileSection title="Résumés" description="Upload PDF or DOCX files. CareerBridge extracts job-relevant profile evidence after upload.">
            {resumesQuery.isLoading && <Skeleton className="h-20" />}
            {resumes.map((resume) => <div key={resume.id} className="mb-3 flex flex-col gap-4 rounded-xl bg-[var(--cb-bg-subtle)] p-4 last:mb-0 sm:flex-row sm:items-center"><span className="grid size-11 place-items-center rounded-xl bg-[var(--cb-primary-soft)] text-[var(--cb-primary)]"><FileText /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{resume.originalFileName}</p><p className="mt-1 text-xs text-[var(--cb-text-muted)]">{resume.isPrimary ? 'Primary résumé' : 'Résumé'} · {resume.parseStatus.toLocaleLowerCase()} · {Math.ceil(resume.fileSize / 1024)} KB</p></div><div className="flex gap-2">{!resume.isPrimary && <Button variant="secondary" size="sm" disabled={resumeMutation.isPending} onClick={() => resumeMutation.mutate({ action: 'primary', resumeId: resume.id })}>Set primary</Button>}<Button variant="dangerSoft" size="iconSm" disabled={resumeMutation.isPending} onClick={() => resumeMutation.mutate({ action: 'delete', resumeId: resume.id })} aria-label={`Delete ${resume.originalFileName}`}><Trash2 /></Button></div></div>)}
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
    </div>
  );
}
