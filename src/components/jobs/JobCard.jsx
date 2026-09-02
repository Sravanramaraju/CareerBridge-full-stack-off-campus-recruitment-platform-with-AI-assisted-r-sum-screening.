import { Bookmark, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { getCompanyById } from '@/src/data/mockData';
import { JobMeta } from '@/src/components/jobs/JobMeta';
import { MatchSummary } from '@/src/components/jobs/MatchSummary';
import { formatPostedDate } from '@/src/lib/jobFormatting';

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

      <JobMeta job={job} />

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-[var(--cb-text-secondary)]">{job.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="primary">{job.workMode}</Badge>
        <Badge>{job.employmentType}</Badge>
        {job.skills.slice(0, 3).map((skill) => <Badge key={skill}>{skill}</Badge>)}
        {job.skills.length > 3 && <Badge>+{job.skills.length - 3} more</Badge>}
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-[var(--cb-divider)] pt-4 text-xs text-[var(--cb-text-muted)]">
        <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" aria-hidden="true" />{formatPostedDate(job.postedAt)}</span>
        {match ? <MatchSummary score={match} label="match" /> : <Link to={`/jobs/${job.id}`} className="font-semibold text-[var(--cb-primary)] hover:underline">View role</Link>}
      </div>
    </article>
  );
}
