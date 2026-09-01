import { Bookmark, BriefcaseBusiness, Clock3, IndianRupee, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { getCompanyById } from '@/src/data/mockData';

function timeSincePosted(date) {
  const days = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 86400000));
  return days === 1 ? '1 day ago' : `${days} days ago`;
}

export function JobCard({ job, onSave, isSaved = false, match }) {
  const company = getCompanyById(job.companyId);

  return (
    <article className="surface-card group flex h-full flex-col p-5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--cb-border-strong)] hover:shadow-[var(--cb-shadow-raised)] sm:p-6">
      <div className="flex items-start gap-4">
        <div
          className="grid size-12 shrink-0 place-items-center rounded-xl text-sm font-extrabold text-white"
          style={{ backgroundColor: company.accent }}
          aria-hidden="true"
        >
          {company.initials}
        </div>
        <div className="min-w-0 flex-1">
          <Link to={`/jobs/${job.id}`} className="font-heading text-lg font-bold tracking-[-0.02em] hover:text-[var(--cb-primary)]">
            {job.title}
          </Link>
          <p className="mt-1 text-sm font-medium text-[var(--cb-text-secondary)]">{company.name}</p>
        </div>
        <Button
          type="button"
          variant={isSaved ? 'soft' : 'ghost'}
          size="iconSm"
          onClick={() => onSave?.(job.id)}
          aria-label={isSaved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`}
        >
          <Bookmark aria-hidden="true" className={isSaved ? 'fill-current' : ''} />
        </Button>
      </div>

      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-[var(--cb-text-secondary)]">
        <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" aria-hidden="true" />{job.location}</span>
        <span className="inline-flex items-center gap-1.5"><BriefcaseBusiness className="size-4" aria-hidden="true" />{job.experience}</span>
        <span className="inline-flex items-center gap-1.5"><IndianRupee className="size-4" aria-hidden="true" />{job.salary.replace('₹', '')}</span>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-[var(--cb-text-secondary)]">{job.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="primary">{job.workMode}</Badge>
        <Badge>{job.employmentType}</Badge>
        {job.skills.slice(0, 2).map((skill) => <Badge key={skill}>{skill}</Badge>)}
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-[var(--cb-divider)] pt-4 text-xs text-[var(--cb-text-muted)]">
        <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" aria-hidden="true" />{timeSincePosted(job.postedAt)}</span>
        {match ? <span className="font-semibold text-[var(--cb-emerald)]" title="CareerBridge match is a guidance signal, not an employer decision.">{match}% match</span> : <Link to={`/jobs/${job.id}`} className="font-semibold text-[var(--cb-primary)] hover:underline">View role</Link>}
      </div>
    </article>
  );
}
