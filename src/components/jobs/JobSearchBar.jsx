import { useState } from 'react';
import { BriefcaseBusiness, MapPin, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';

export function JobSearchBar({ initialValues = {}, compact = false }) {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const [keyword, setKeyword] = useState(initialValues.keyword || '');
  const [locationValue, setLocationValue] = useState(initialValues.location || '');
  const [experience, setExperience] = useState(initialValues.experience || '');

  function handleSubmit(event) {
    event.preventDefault();
    const params = routeLocation.pathname === '/jobs' ? new URLSearchParams(routeLocation.search) : new URLSearchParams();
    if (keyword.trim()) params.set('q', keyword.trim()); else params.delete('q');
    if (locationValue.trim()) params.set('location', locationValue.trim()); else params.delete('location');
    if (experience) params.set('experience', experience); else params.delete('experience');
    void navigate(`/jobs${params.size ? `?${params.toString()}` : ''}`);
  }

  return (
    <search aria-label="Search jobs">
      <form
        onSubmit={handleSubmit}
        className={`grid border border-[var(--cb-border)] bg-[var(--cb-surface-raised)] p-2 shadow-[var(--cb-shadow-raised)] ${compact ? 'rounded-xl lg:grid-cols-[1.35fr_1fr_auto]' : 'rounded-2xl lg:grid-cols-[1.4fr_1fr_0.85fr_auto]'}`}
      >
      <label className="flex min-h-14 items-center gap-3 border-b border-[var(--cb-divider)] px-3 lg:border-b-0 lg:border-r">
        <Search className="size-5 text-[var(--cb-text-muted)]" aria-hidden="true" />
        <span className="sr-only">Role, skill or company</span>
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-[var(--cb-text-muted)]"
          placeholder="Role, skill or company"
        />
      </label>
      <label className="flex min-h-14 items-center gap-3 border-b border-[var(--cb-divider)] px-3 lg:border-b-0 lg:border-r">
        <MapPin className="size-5 text-[var(--cb-text-muted)]" aria-hidden="true" />
        <span className="sr-only">City or remote</span>
        <input
          value={locationValue}
          onChange={(event) => setLocationValue(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-[var(--cb-text-muted)]"
          placeholder="City or remote"
        />
      </label>
      {!compact && (
        <label className="flex min-h-14 items-center gap-3 border-b border-[var(--cb-divider)] px-3 lg:border-b-0 lg:border-r">
          <BriefcaseBusiness className="size-5 text-[var(--cb-text-muted)]" aria-hidden="true" />
          <span className="sr-only">Experience</span>
          <select
            value={experience}
            onChange={(event) => setExperience(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[var(--cb-text-secondary)] outline-none"
          >
            <option value="">Experience</option>
            <option value="Fresher">Fresher</option>
            <option value="0–1 years">0–1 years</option>
            <option value="1–2 years">1–2 years</option>
            <option value="2–3 years">2–3 years</option>
          </select>
        </label>
      )}
        <Button type="submit" size="hero" className="mt-2 min-w-36 lg:mt-0 lg:ml-2">
          <Search aria-hidden="true" /> Search jobs
        </Button>
      </form>
    </search>
  );
}
