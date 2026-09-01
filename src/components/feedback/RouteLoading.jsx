import { Skeleton } from '@/src/components/ui/Feedback';

export function RouteLoading() {
  return (
    <main className="page-container py-10" aria-label="Loading page">
      <div className="max-w-2xl"><Skeleton className="h-4 w-28" /><Skeleton className="mt-4 h-9 w-3/4" /><Skeleton className="mt-3 h-4 w-full" /></div>
      <div className="mt-8 grid gap-4 md:grid-cols-2"><Skeleton className="h-56" /><Skeleton className="h-56" /></div>
    </main>
  );
}
