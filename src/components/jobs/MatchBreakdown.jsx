import { Badge } from '@/src/components/ui/Badge';

const scoreRows = [
  ['Required skills', 'requiredSkills'],
  ['Preferred skills', 'preferredSkills'],
  ['Experience', 'experience'],
  ['Education', 'education'],
  ['Location / work mode', 'location'],
  ['Semantic relevance', 'semanticSimilarity'],
];

export function MatchBreakdown({ breakdown }) {
  return (
    <section aria-label="Match explanation">
      <div className="grid gap-3">
        {scoreRows.map(([label, key]) => {
          const value = breakdown[key];
          const numericValue = typeof value === 'number' ? value : value === 'Matched' ? 100 : 0;
          return (
            <div key={key}>
              <div className="flex justify-between gap-4 text-xs"><span className="text-[var(--cb-text-secondary)]">{label}</span><strong>{typeof value === 'number' ? `${value}%` : value}</strong></div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--cb-bg-subtle)]"><div className="h-full rounded-full bg-[var(--cb-primary)]" style={{ width: `${numericValue}%` }} /></div>
            </div>
          );
        })}
      </div>
      {breakdown.matchedSkills?.length > 0 && <div className="mt-5"><p className="text-xs font-bold">Strong matches</p><div className="mt-2 flex flex-wrap gap-2">{breakdown.matchedSkills.map((skill) => <Badge key={skill} variant="success">{skill}</Badge>)}</div></div>}
      {breakdown.missingSkills?.length > 0 && <div className="mt-4"><p className="text-xs font-bold">Missing from profile</p><div className="mt-2 flex flex-wrap gap-2">{breakdown.missingSkills.map((skill) => <Badge key={skill} variant="warning">{skill}</Badge>)}</div></div>}
      <p className="mt-5 text-xs leading-5 text-[var(--cb-text-muted)]">Match reflects job-related profile information and supports—not replaces—human review.</p>
    </section>
  );
}
