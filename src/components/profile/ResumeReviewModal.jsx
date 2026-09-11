import { useState } from 'react';
import { Button } from '@/src/components/ui/Button';
import { Input, TextArea } from '@/src/components/ui/Input';
import { Modal, ModalContent } from '@/src/components/ui/Modal';

const EVIDENCE_GROUPS = [
  ['educationEvidence', 'education', 'Detected education'],
  ['experienceEvidence', 'experience', 'Detected experience'],
  ['projectEvidence', 'projects', 'Detected projects'],
];

function initialSkills(parsedData) {
  return (parsedData?.skills || []).map((skill, index) => ({
    id: `${skill.name}-${index}`,
    name: skill.name,
    selected: true,
  }));
}

function recordDraft(type, sourceText) {
  if (type === 'education') return { institution: '', qualification: '', description: sourceText };
  if (type === 'experience') return { title: '', organization: '', description: sourceText };
  return { name: '', description: sourceText };
}

export function ResumeReviewModal({ resume, existingSkills, onApplySkills, onCreateRecord, onClose, pending }) {
  const parsedData = resume.parsedData || {};
  const [skills, setSkills] = useState(() => initialSkills(parsedData));
  const [evidence, setEvidence] = useState(() => Object.fromEntries(
    EVIDENCE_GROUPS.map(([key]) => [key, (parsedData[key] || []).map((item) => item.sourceText)]),
  ));

  function applySkills() {
    const names = skills.filter((skill) => skill.selected).map((skill) => skill.name.trim()).filter(Boolean);
    const uniqueNames = [...new Map(
      [...existingSkills, ...names].map((name) => [name.toLocaleLowerCase(), name]),
    ).values()];
    onApplySkills(uniqueNames.map((name) => ({ name })));
  }

  return (
    <Modal open onOpenChange={(open) => !open && onClose()}>
      <ModalContent title={`Review suggestions from ${resume.originalFileName}`} description="Nothing is added automatically. Select and correct only evidence you can verify.">
        <div className="grid gap-6">
          <section>
            <h3 className="text-sm font-bold">Extracted skills</h3>
            {skills.length === 0 && <p className="mt-2 text-xs text-[var(--cb-text-muted)]">No skills were confidently detected.</p>}
            <div className="mt-3 grid gap-2">{skills.map((skill, index) => (
              <label key={skill.id} className="flex items-center gap-2 rounded-lg bg-[var(--cb-bg-subtle)] p-2">
                <input type="checkbox" checked={skill.selected} onChange={(event) => setSkills((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, selected: event.target.checked } : item))} aria-label={`Select ${skill.name}`} />
                <Input value={skill.name} disabled={!skill.selected} onChange={(event) => setSkills((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} aria-label={`Edit skill ${index + 1}`} />
              </label>
            ))}</div>
            {skills.length > 0 && <Button type="button" className="mt-3" disabled={pending || !skills.some((skill) => skill.selected && skill.name.trim())} onClick={applySkills}>{pending ? 'Applying…' : 'Apply selected skills'}</Button>}
          </section>

          {EVIDENCE_GROUPS.map(([key, type, title]) => evidence[key]?.length > 0 && (
            <section key={key} className="border-t border-[var(--cb-divider)] pt-5">
              <h3 className="text-sm font-bold">{title}</h3>
              <p className="mt-1 text-xs text-[var(--cb-text-muted)]">Review the extracted text, then complete the required profile fields before saving.</p>
              <div className="mt-3 grid gap-3">{evidence[key].map((sourceText, index) => (
                <div key={`${key}-${index}`} className="rounded-lg bg-[var(--cb-bg-subtle)] p-3">
                  <TextArea value={sourceText} onChange={(event) => setEvidence((current) => ({ ...current, [key]: current[key].map((item, itemIndex) => itemIndex === index ? event.target.value : item) }))} aria-label={`${title} suggestion ${index + 1}`} />
                  <Button type="button" variant="secondary" size="sm" className="mt-2" disabled={!sourceText.trim()} onClick={() => onCreateRecord(type, recordDraft(type, sourceText.trim()))}>Review and add</Button>
                </div>
              ))}</div>
            </section>
          ))}

          {parsedData.contactSuggestions && (parsedData.contactSuggestions.email || parsedData.contactSuggestions.phone) && (
            <section className="border-t border-[var(--cb-divider)] pt-5"><h3 className="text-sm font-bold">Contact suggestions</h3><p className="mt-2 text-xs text-[var(--cb-text-muted)]">Verify these against your account before making profile changes.</p><p className="mt-2 text-sm text-[var(--cb-text-secondary)]">{[parsedData.contactSuggestions.email, parsedData.contactSuggestions.phone].filter(Boolean).join(' · ')}</p></section>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}
