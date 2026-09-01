import { useRef, useState } from 'react';
import { FileSearch, FileText, MapPin, Pencil, Plus, Sparkles, Trash2, Upload, UserRound } from 'lucide-react';
import { Avatar } from '@/src/components/ui/Avatar';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { ProgressBar } from '@/src/components/ui/Feedback';
import { Input, TextArea } from '@/src/components/ui/Input';
import { Modal, ModalContent } from '@/src/components/ui/Modal';
import { useAppStore } from '@/src/store/useAppStore';

function ProfileSection({ title, description, action, children }) {
  return (
    <section className="surface-card p-6">
      <header className="flex items-start justify-between gap-4"><div><h2 className="font-heading text-lg font-bold">{title}</h2>{description && <p className="mt-1 text-xs leading-5 text-[var(--cb-text-muted)]">{description}</p>}</div>{action}</header>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function ProfilePage() {
  const profile = useAppStore((state) => state.profile);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const [basicOpen, setBasicOpen] = useState(false);
  const [extractOpen, setExtractOpen] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [basicForm, setBasicForm] = useState({ name: profile.name, headline: profile.headline, location: profile.location });
  const fileInputRef = useRef(null);
  const skills = profile.skills || [];
  const education = profile.education || [{ institution: 'Visvesvaraya Technological University', qualification: 'B.E. in Computer Science', period: '2022–2026' }];
  const projects = profile.projects || [{ name: 'Campus Opportunity Tracker', description: 'A responsive placement and application tracking dashboard.' }];
  const certifications = profile.certifications || ['Responsive Web Design · freeCodeCamp'];
  const preferences = profile.preferences || { locations: ['Bengaluru', 'Remote'], jobTypes: ['Full-time'], workModes: ['Hybrid'] };

  function saveBasic(event) {
    event.preventDefault();
    updateProfile(basicForm);
    setBasicOpen(false);
  }

  function addSkill(event) {
    event.preventDefault();
    const nextSkill = skillInput.trim();
    if (nextSkill && !skills.some((skill) => skill.toLocaleLowerCase() === nextSkill.toLocaleLowerCase())) updateProfile({ skills: [...skills, nextSkill] });
    setSkillInput('');
  }

  function handleResume(event) {
    const file = event.target.files?.[0];
    if (file) updateProfile({ resumeName: file.name, profileCompletion: Math.max(profile.profileCompletion || 0, 82) });
  }

  function applyExtractedProfile() {
    updateProfile({ skills: [...new Set([...skills, 'REST APIs', 'Accessibility'])], profileCompletion: Math.max(profile.profileCompletion || 0, 86) });
    setExtractOpen(false);
  }

  return (
    <div>
      <header><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--cb-primary)]">Professional profile</p><h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Make your evidence easy to understand</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--cb-text-secondary)]">Keep your skills, projects, preferences, and resume current so recommendations have useful context.</p></header>
      <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-5">
          <section className="surface-card p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start"><Avatar name={profile.name} size="lg" /><div className="min-w-0 flex-1"><h2 className="font-heading text-2xl font-extrabold">{profile.name}</h2><p className="mt-1 text-sm font-medium text-[var(--cb-text-secondary)]">{profile.headline}</p><p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--cb-text-muted)]"><MapPin className="size-4" />{profile.location} · {profile.email || 'applicant@careerbridge.demo'}</p></div><Button variant="secondary" size="sm" onClick={() => setBasicOpen(true)}><Pencil />Edit basic info</Button></div>
          </section>

          <ProfileSection title="Professional summary" action={<Button variant="ghost" size="sm"><Pencil />Edit</Button>}><p className="text-sm leading-7 text-[var(--cb-text-secondary)]">{profile.summary || 'Add a concise summary of the work you want to do and the evidence you bring.'}</p></ProfileSection>

          <ProfileSection title="Skills" description="Use skills you can support with coursework, projects, or experience.">
            <div className="flex flex-wrap gap-2">{skills.map((skill) => <button key={skill} type="button" onClick={() => updateProfile({ skills: skills.filter((item) => item !== skill) })} title={`Remove ${skill}`}><Badge variant="primary" className="min-h-8 px-3">{skill} <span aria-hidden="true">×</span></Badge></button>)}</div>
            <form onSubmit={addSkill} className="mt-4 flex gap-2"><Input value={skillInput} onChange={(event) => setSkillInput(event.target.value)} placeholder="Add a skill" aria-label="Add a skill" /><Button type="submit" variant="secondary"><Plus />Add</Button></form>
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

          <ProfileSection title="Resume" description="PDF or DOCX · mock upload stored only as a filename on this device.">
            {profile.resumeName ? <div className="flex flex-col gap-4 rounded-xl bg-[var(--cb-bg-subtle)] p-4 sm:flex-row sm:items-center"><span className="grid size-11 place-items-center rounded-xl bg-[var(--cb-primary-soft)] text-[var(--cb-primary)]"><FileText /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{profile.resumeName}</p><p className="mt-1 text-xs text-[var(--cb-text-muted)]">Updated in this demo profile</p></div><div className="flex gap-2"><Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}><Upload />Replace</Button><Button variant="dangerSoft" size="iconSm" onClick={() => updateProfile({ resumeName: '' })} aria-label="Delete resume"><Trash2 /></Button></div></div> : <button type="button" onClick={() => fileInputRef.current?.click()} className="flex w-full flex-col items-center rounded-xl border border-dashed p-7 text-center hover:border-[var(--cb-primary)]"><Upload className="text-[var(--cb-primary)]" /><span className="mt-3 text-sm font-bold">Choose a resume</span><span className="mt-1 text-xs text-[var(--cb-text-muted)]">No file is uploaded to a server in this demo.</span></button>}
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={handleResume} />
            <Button variant="soft" className="mt-4" onClick={() => setExtractOpen(true)} disabled={!profile.resumeName}><Sparkles />Extract profile from resume</Button>
          </ProfileSection>

          <ProfileSection title="Preferences" action={<Button variant="ghost" size="sm"><Pencil />Edit</Button>}>
            <div className="grid gap-4 sm:grid-cols-3">{[['Preferred locations', preferences.locations], ['Job types', preferences.jobTypes], ['Work modes', preferences.workModes]].map(([label, values]) => <div key={label}><p className="text-xs font-bold text-[var(--cb-text-muted)]">{label}</p><div className="mt-2 flex flex-wrap gap-1.5">{values.map((value) => <Badge key={value}>{value}</Badge>)}</div></div>)}</div>
          </ProfileSection>
        </div>

        <aside className="grid gap-5 lg:sticky lg:top-24">
          <section className="surface-card p-6"><p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--cb-primary)]">Profile completion</p><h2 className="mt-2 font-heading text-2xl font-extrabold">{profile.profileCompletion || 78}%</h2><ProgressBar className="mt-4" value={profile.profileCompletion || 78} /><ul className="mt-5 grid gap-3 text-xs text-[var(--cb-text-secondary)]">{['Basic details complete', 'Resume added', 'Add recent project outcomes', 'Add one experience example'].map((item, index) => <li key={item} className="flex gap-2"><span className={`mt-0.5 grid size-4 place-items-center rounded-full text-[10px] ${index < 2 ? 'bg-[var(--cb-emerald)] text-white' : 'border border-[var(--cb-border-strong)]'}`}>{index < 2 ? '✓' : ''}</span>{item}</li>)}</ul></section>
          <section className="rounded-2xl border border-[var(--cb-cyan)] bg-[var(--cb-cyan-soft)] p-5"><FileSearch className="text-[var(--cb-cyan-strong)]" /><h2 className="mt-3 font-heading text-base font-bold">Resume extraction is simulated</h2><p className="mt-2 text-xs leading-5 text-[var(--cb-text-secondary)]">CareerBridge shows an editable review before changing your profile. This demo never claims a production AI call.</p></section>
        </aside>
      </div>

      <Modal open={basicOpen} onOpenChange={setBasicOpen}><ModalContent title="Edit basic information" description="Keep this concise and aligned with the roles you want."><form onSubmit={saveBasic} className="grid gap-4"><label htmlFor="profile-name" className="grid gap-1.5 text-sm font-semibold">Full name<Input id="profile-name" value={basicForm.name} onChange={(event) => setBasicForm({ ...basicForm, name: event.target.value })} /></label><label htmlFor="profile-headline" className="grid gap-1.5 text-sm font-semibold">Professional headline<TextArea id="profile-headline" className="min-h-20" value={basicForm.headline} onChange={(event) => setBasicForm({ ...basicForm, headline: event.target.value })} /></label><label htmlFor="profile-location" className="grid gap-1.5 text-sm font-semibold">Location<Input id="profile-location" value={basicForm.location} onChange={(event) => setBasicForm({ ...basicForm, location: event.target.value })} /></label><div className="flex justify-end"><Button type="submit">Save changes</Button></div></form></ModalContent></Modal>

      <Modal open={extractOpen} onOpenChange={setExtractOpen}><ModalContent title="Review extracted profile" description="Simulated suggestions from your demo resume. Approve or correct these before saving."><div className="rounded-xl border border-[var(--cb-amber)] bg-[var(--cb-amber-soft)] p-3 text-xs leading-5 text-[var(--cb-text-secondary)]">Demo simulation only — no document was parsed and no AI service was called.</div><div className="mt-5 grid gap-4">{[['Skills', 'REST APIs, Accessibility'], ['Education', 'B.E. in Computer Science'], ['Experience', 'No formal experience detected'], ['Projects', 'Campus Opportunity Tracker']].map(([label, value]) => { const id = `extract-${label.toLocaleLowerCase()}`; return <label key={label} htmlFor={id} className="grid gap-1.5 text-sm font-semibold">{label}<Input id={id} defaultValue={value} /></label>; })}</div><div className="mt-5 flex justify-end"><Button onClick={applyExtractedProfile}><UserRound />Apply reviewed details</Button></div></ModalContent></Modal>
    </div>
  );
}
