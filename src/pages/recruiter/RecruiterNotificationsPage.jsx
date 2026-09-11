import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, BriefcaseBusiness, CalendarClock, CheckCheck, UsersRound } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { EmptyState, Skeleton } from '@/src/components/ui/Feedback';
import { cn } from '@/src/lib/utils';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';
import { notificationsService } from '@/src/services/notificationsService';
import { queryKeys } from '@/src/services/queryKeys';

const notificationIcons = [UsersRound, CalendarClock, BriefcaseBusiness, CalendarClock, BriefcaseBusiness, UsersRound];

export function RecruiterNotificationsPage() {
  useDocumentTitle('Recruiter notifications');
  const [filter, setFilter] = useState('All');
  const queryClient = useQueryClient();
  const filters = { page: 1, pageSize: 50 };
  const notificationsQuery = useQuery({ queryKey: queryKeys.notifications(filters), queryFn: ({ signal }) => notificationsService.getNotifications(filters, { signal }) });
  const readMutation = useMutation({ mutationFn: (id) => notificationsService.markRead(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }) });
  const readAllMutation = useMutation({ mutationFn: () => notificationsService.markAllRead(), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }) });
  const notifications = notificationsQuery.data?.items || [];
  const isUnread = (notification) => !notification.isRead;
  const unreadCount = notificationsQuery.data?.unreadCount || 0;
  const visible = filter === 'Unread' ? notifications.filter(isUnread) : notifications;

  return (
    <div className="max-w-4xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--cb-primary)]">Hiring updates</p><h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Notifications</h1><p className="mt-2 text-sm text-[var(--cb-text-secondary)]">Keep candidate actions and role deadlines visible.</p></div>{unreadCount > 0 && <Button variant="secondary" disabled={readAllMutation.isPending} onClick={() => readAllMutation.mutate()}><CheckCheck />{readAllMutation.isPending ? 'Marking…' : 'Mark all read'}</Button>}</header>

      <div className="mt-7 flex gap-1 border-b border-[var(--cb-divider)] pb-3" role="tablist" aria-label="Notification filter">{['All', 'Unread'].map((label) => <button key={label} type="button" role="tab" aria-selected={filter === label} onClick={() => setFilter(label)} className={cn('rounded-lg px-4 py-2 text-sm font-bold', filter === label ? 'bg-[var(--cb-primary-soft)] text-[var(--cb-primary)]' : 'text-[var(--cb-text-secondary)] hover:bg-[var(--cb-bg-subtle)]')}>{label}{label === 'Unread' && <span className="ml-2 text-xs">{unreadCount}</span>}</button>)}</div>

      {notificationsQuery.isLoading && <div className="surface-card mt-6 p-5"><Skeleton className="h-12" /><Skeleton className="mt-5 h-12" /><Skeleton className="mt-5 h-12" /></div>}
      {notificationsQuery.isError && <EmptyState className="mt-6" icon={Bell} title="Notifications could not be loaded" description="Please try again in a moment." actionLabel="Try again" onAction={() => notificationsQuery.refetch()} />}
      {notificationsQuery.isSuccess && visible.length === 0 && <EmptyState className="mt-6" icon={Bell} title="You’re all caught up" description="New candidate and job updates will appear here." />}
      {visible.length > 0 && <section className="surface-card mt-6 divide-y divide-[var(--cb-divider)]" aria-label="Recruiter notifications">{visible.map((notification, index) => { const Icon = notificationIcons[index % notificationIcons.length]; const unread = isUnread(notification); return (
        <article key={notification.id} className={cn('flex gap-4 p-5', unread && 'bg-[var(--cb-primary-soft)]/45')}>
          <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', unread ? 'bg-[var(--cb-primary)] text-white' : 'bg-[var(--cb-bg-subtle)] text-[var(--cb-text-muted)]')}><Icon className="size-5" /></span>
          <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-4"><div><h2 className="text-sm font-bold">{notification.title}</h2><p className="mt-1 text-sm leading-6 text-[var(--cb-text-secondary)]">{notification.message}</p></div>{unread && <span className="mt-1 size-2 shrink-0 rounded-full bg-[var(--cb-primary)]" aria-label="Unread" />}</div><div className="mt-3 flex items-center justify-between"><time dateTime={notification.createdAt} className="text-xs text-[var(--cb-text-muted)]">{new Date(notification.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</time>{unread && <button type="button" disabled={readMutation.isPending} onClick={() => readMutation.mutate(notification.id)} className="text-xs font-bold text-[var(--cb-primary)] hover:underline">Mark as read</button>}</div></div>
        </article>
      ); })}</section>}
      <p className="mt-4 text-xs leading-5 text-[var(--cb-text-muted)]">Read state follows your CareerBridge account across sessions.</p>
    </div>
  );
}
