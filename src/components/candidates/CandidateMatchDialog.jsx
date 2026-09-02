import { Badge } from '@/src/components/ui/Badge';
import { ProgressBar } from '@/src/components/ui/Feedback';
import { Modal, ModalContent } from '@/src/components/ui/Modal';

export function CandidateMatchDialog({ candidate, onClose }) {
  return (
    <Modal open={Boolean(candidate)} onOpenChange={(open) => !open && onClose()}>
      <ModalContent title={candidate ? `${candidate.name} · ${candidate.match}% match` : 'Candidate match'} description="A transparent, job-relevant assistance signal for consistent human review.">
        {candidate && (
          <div>
            <ProgressBar value={candidate.match} />
            <dl className="mt-5 grid gap-3 rounded-xl bg-[var(--cb-bg-subtle)] p-4 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-[var(--cb-text-secondary)]">Required skill coverage</dt><dd className="font-bold">{candidate.requiredCoverage}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[var(--cb-text-secondary)]">Preferred skill coverage</dt><dd className="font-bold">{candidate.preferredCoverage}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[var(--cb-text-secondary)]">Experience alignment</dt><dd className="font-bold text-[var(--cb-emerald)]">Matched</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[var(--cb-text-secondary)]">Location / work mode</dt><dd className="font-bold text-[var(--cb-emerald)]">Matched</dd></div>
            </dl>
            {candidate.missing.length > 0 && <div className="mt-5"><p className="text-xs font-bold text-[var(--cb-text-muted)]">Missing or unconfirmed</p><div className="mt-2 flex flex-wrap gap-2">{candidate.missing.map((item) => <Badge key={item} variant="warning">{item}</Badge>)}</div></div>}
            <p className="mt-5 border-t border-[var(--cb-divider)] pt-4 text-xs leading-5 text-[var(--cb-text-muted)]">This mock score uses skills, experience, eligibility, location/work mode, and semantic resume relevance only. It never evaluates protected or sensitive attributes and must not replace human review.</p>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}
