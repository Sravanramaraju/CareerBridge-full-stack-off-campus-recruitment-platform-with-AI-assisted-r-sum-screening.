import { useState } from 'react';
import { Button } from '@/src/components/ui/Button';
import { Input, TextArea } from '@/src/components/ui/Input';
import { Modal, ModalContent } from '@/src/components/ui/Modal';

const TYPE_LABELS = {
  education: 'education',
  experience: 'experience',
  projects: 'project',
  certifications: 'certification',
};

function dateInput(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : '';
}

function initialValues(type, record = {}) {
  if (type === 'education') return {
    institution: record.institution || '', qualification: record.qualification || '',
    fieldOfStudy: record.fieldOfStudy || '', startYear: record.startYear || '',
    endYear: record.endYear || '', isCurrent: Boolean(record.isCurrent),
    grade: record.grade || '', description: record.description || '',
  };
  if (type === 'experience') return {
    title: record.title || '', organization: record.organization || '',
    location: record.location || '', employmentType: record.employmentType || '',
    startDate: dateInput(record.startDate), endDate: dateInput(record.endDate),
    isCurrent: Boolean(record.isCurrent), description: record.description || '',
  };
  if (type === 'projects') return {
    name: record.name || '', description: record.description || '',
    projectUrl: record.projectUrl || '', repositoryUrl: record.repositoryUrl || '',
    technologies: (record.technologies || []).join(', '),
    startedAt: dateInput(record.startedAt), completedAt: dateInput(record.completedAt),
  };
  return {
    name: record.name || '', issuer: record.issuer || '',
    issuedAt: dateInput(record.issuedAt), expiresAt: dateInput(record.expiresAt),
    credentialId: record.credentialId || '', credentialUrl: record.credentialUrl || '',
  };
}

const nullable = (value) => value.trim() || null;
const year = (value) => value === '' ? null : Number(value);

export function buildProfileRecordPayload(type, values) {
  if (type === 'education') return {
    institution: values.institution.trim(), qualification: values.qualification.trim(),
    fieldOfStudy: nullable(values.fieldOfStudy), startYear: year(values.startYear),
    endYear: values.isCurrent ? null : year(values.endYear), isCurrent: values.isCurrent,
    grade: nullable(values.grade), description: nullable(values.description), displayOrder: 0,
  };
  if (type === 'experience') return {
    title: values.title.trim(), organization: values.organization.trim(),
    location: nullable(values.location), employmentType: nullable(values.employmentType),
    startDate: nullable(values.startDate), endDate: values.isCurrent ? null : nullable(values.endDate),
    isCurrent: values.isCurrent, description: nullable(values.description), displayOrder: 0,
  };
  if (type === 'projects') return {
    name: values.name.trim(), description: values.description.trim(),
    projectUrl: nullable(values.projectUrl), repositoryUrl: nullable(values.repositoryUrl),
    technologies: values.technologies.split(',').map((item) => item.trim()).filter(Boolean),
    startedAt: nullable(values.startedAt), completedAt: nullable(values.completedAt), displayOrder: 0,
  };
  return {
    name: values.name.trim(), issuer: values.issuer.trim(),
    issuedAt: nullable(values.issuedAt), expiresAt: nullable(values.expiresAt),
    credentialId: nullable(values.credentialId), credentialUrl: nullable(values.credentialUrl),
    displayOrder: 0,
  };
}

function Field({ label, name, values, setValues, ...props }) {
  const id = `profile-record-${name}`;
  return <label htmlFor={id} className="grid gap-1.5 text-sm font-semibold">{label}<Input {...props} id={id} name={name} value={values[name]} onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))} /></label>;
}

export function ProfileRecordModal({ editor, onClose, onSave, pending }) {
  const [values, setValues] = useState(() => initialValues(editor.type, editor.record || editor.initialValues));
  const type = editor.type;
  const label = TYPE_LABELS[type];

  function submit(event) {
    event.preventDefault();
    onSave(buildProfileRecordPayload(type, values));
  }

  return (
    <Modal open onOpenChange={(open) => !open && onClose()}>
      <ModalContent title={`${editor.record ? 'Edit' : 'Add'} ${label}`} description="Use concise, verifiable information that supports your applications.">
        <form onSubmit={submit} className="grid max-h-[70vh] gap-4 overflow-y-auto pr-1">
          {type === 'education' && <><Field required label="Institution" name="institution" values={values} setValues={setValues} /><Field required label="Qualification" name="qualification" values={values} setValues={setValues} /><Field label="Field of study" name="fieldOfStudy" values={values} setValues={setValues} /><div className="grid grid-cols-2 gap-3"><Field label="Start year" name="startYear" type="number" min="1950" max="2100" values={values} setValues={setValues} /><Field label="End year" name="endYear" type="number" min="1950" max="2100" disabled={values.isCurrent} values={values} setValues={setValues} /></div><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={values.isCurrent} onChange={(event) => setValues({ ...values, isCurrent: event.target.checked })} />Currently studying</label><Field label="Grade" name="grade" values={values} setValues={setValues} /></>}
          {type === 'experience' && <><Field required label="Role title" name="title" values={values} setValues={setValues} /><Field required label="Organization" name="organization" values={values} setValues={setValues} /><Field label="Location" name="location" values={values} setValues={setValues} /><Field label="Employment type" name="employmentType" values={values} setValues={setValues} /><div className="grid grid-cols-2 gap-3"><Field label="Start date" name="startDate" type="date" values={values} setValues={setValues} /><Field label="End date" name="endDate" type="date" disabled={values.isCurrent} values={values} setValues={setValues} /></div><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={values.isCurrent} onChange={(event) => setValues({ ...values, isCurrent: event.target.checked })} />I currently work here</label></>}
          {type === 'projects' && <><Field required label="Project name" name="name" values={values} setValues={setValues} /><Field label="Project URL" name="projectUrl" type="url" values={values} setValues={setValues} /><Field label="Repository URL" name="repositoryUrl" type="url" values={values} setValues={setValues} /><Field label="Technologies" name="technologies" placeholder="React, Node.js, PostgreSQL" values={values} setValues={setValues} /><div className="grid grid-cols-2 gap-3"><Field label="Started" name="startedAt" type="date" values={values} setValues={setValues} /><Field label="Completed" name="completedAt" type="date" values={values} setValues={setValues} /></div></>}
          {type === 'certifications' && <><Field required label="Certification" name="name" values={values} setValues={setValues} /><Field required label="Issuer" name="issuer" values={values} setValues={setValues} /><div className="grid grid-cols-2 gap-3"><Field label="Issued" name="issuedAt" type="date" values={values} setValues={setValues} /><Field label="Expires" name="expiresAt" type="date" values={values} setValues={setValues} /></div><Field label="Credential ID" name="credentialId" values={values} setValues={setValues} /><Field label="Credential URL" name="credentialUrl" type="url" values={values} setValues={setValues} /></>}
          {(type === 'education' || type === 'experience' || type === 'projects') && <label htmlFor="profile-record-description" className="grid gap-1.5 text-sm font-semibold">Description<TextArea id="profile-record-description" required={type === 'projects'} value={values.description} maxLength={3000} onChange={(event) => setValues({ ...values, description: event.target.value })} /></label>}
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" disabled={pending}>{pending ? 'Saving…' : `Save ${label}`}</Button></div>
        </form>
      </ModalContent>
    </Modal>
  );
}
