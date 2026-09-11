import { Badge } from '@/src/components/ui/Badge';
import { ProgressBar } from '@/src/components/ui/Feedback';
import { Modal, ModalContent } from '@/src/components/ui/Modal';

export function CandidateMatchDialog({ candidate, onClose }) {
  const details = candidate?.matchDetails;
  const available = Number.isFinite(candidate?.match) && details;
  return (
    <Modal open={Boolean(candidate)} onOpenChange={(open) => !open && onClose()}>
      <ModalContent title={candidate ? `${candidate.name} · ${Number.isFinite(candidate.match) ? `${candidate.match}% match` : 'match unavailable'}` : 'Candidate match'} description="A transparent, job-relevant assistance signal for consistent human review.">
        {candidate && available && (
          <div>
            <ProgressBar value={candidate.match} />
            <dl className="mt-5 grid gap-3 rounded-xl bg-[var(--cb-bg-subtle)] p-4 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-[var(--cb-text-secondary)]">Required skill coverage</dt><dd className="font-bold">{details.requiredSkillScore}%</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[var(--cb-text-secondary)]">Preferred skill coverage</dt><dd className="font-bold">{details.preferredSkillScore}%</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[var(--cb-text-secondary)]">Experience alignment</dt><dd className="font-bold">{details.experienceScore}%</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[var(--cb-text-secondary)]">Location / work mode</dt><dd className="font-bold">{details.preferenceScore}%</dd></div>
            </dl>
            {details.requiredSkillsMissing.length > 0 && <div className="mt-5"><p className="text-xs font-bold text-[var(--cb-text-muted)]">Missing or unconfirmed</p><div className="mt-2 flex flex-wrap gap-2">{details.requiredSkillsMissing.map((item) => <Badge key={item} variant="warning">{item}</Badge>)}</div></div>}
            <p className="mt-5 border-t border-[var(--cb-divider)] pt-4 text-xs leading-5 text-[var(--cb-text-muted)]">This score uses job-relevant evidence only. It never evaluates protected or sensitive attributes and must not replace human review.</p>
          </div>
        )}
        {candidate && !available && <p className="text-sm leading-6 text-[var(--cb-text-secondary)]">A match snapshot is not available for this application. Review the candidate evidence directly.</p>}
      </ModalContent>
    </Modal>
  );
}
