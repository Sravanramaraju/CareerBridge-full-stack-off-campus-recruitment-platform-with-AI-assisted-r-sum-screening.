import { BriefcaseBusiness, IndianRupee, MapPin } from 'lucide-react';
import { formatExperience, formatSalary } from '@/src/lib/jobFormatting';

export function JobMeta({ job, compact = false }) {
  return (
    <div className={`flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-[var(--cb-text-secondary)] ${compact ? '' : 'mt-5'}`}>
      <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" aria-hidden="true" />{job.location}</span>
      <span className="inline-flex items-center gap-1.5"><BriefcaseBusiness className="size-4" aria-hidden="true" />{formatExperience(job.experience)}</span>
      <span className="inline-flex items-center gap-1.5"><IndianRupee className="size-4" aria-hidden="true" />{formatSalary(job.salary).replace('₹', '')}</span>
    </div>
  );
}
