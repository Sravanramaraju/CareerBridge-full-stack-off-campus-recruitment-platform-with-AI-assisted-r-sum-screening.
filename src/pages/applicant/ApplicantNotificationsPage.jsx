import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, BriefcaseBusiness, CalendarCheck, CheckCheck, Eye, UserRoundCheck } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { EmptyState, Skeleton } from '@/src/components/ui/Feedback';
import { Tabs } from '@/src/components/ui/Tabs';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';
import { cn } from '@/src/lib/utils';
import { notificationsService } from '@/src/services/notificationsService';
import { queryKeys } from '@/src/services/queryKeys';
import { useAppStore } from '@/src/store/useAppStore';

const notificationIcons = [CalendarCheck, Eye, BriefcaseBusiness, UserRoundCheck, UserRoundCheck];

export function ApplicantNotificationsPage() {
  useDocumentTitle('Notifications');
  const [filter, setFilter] = useState('all');
  const notificationsQuery = useQuery({ queryKey: queryKeys.notifications('applicant'), queryFn: () => notificationsService.getNotifications('applicant') });
  const readIds = useAppStore((state) => state.readNotificationIds);
  const markNotificationRead = useAppStore((state) => state.markNotificationRead);
  const markAllNotificationsRead = useAppStore((state) => state.markAllNotificationsRead);
  const notifications = notificationsQuery.data || [];
  const isUnread = (notification) => !notification.read && !readIds.includes(notification.id);
  const unreadCount = notifications.filter(isUnread).length;
  const visible = filter === 'unread' ? notifications.filter(isUnread) : notifications;

  return (
    <div className="max-w-4xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--cb-primary)]">Your activity</p><h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Notifications</h1><p className="mt-2 text-sm text-[var(--cb-text-secondary)]">See application progress, recruiter activity, and relevant opportunities.</p></div>
        {unreadCount > 0 && <Button variant="secondary" onClick={() => markAllNotificationsRead(notifications.map((item) => item.id))}><CheckCheck />Mark all read</Button>}
      </header>

      <Tabs className="mt-7 border-b border-[var(--cb-divider)]" label="Notification filter" value={filter} onValueChange={setFilter} items={[{ value: 'all', label: 'All' }, { value: 'unread', label: 'Unread', count: unreadCount }]} />

      {notificationsQuery.isLoading && <div className="surface-card mt-6 p-5"><Skeleton className="h-12" /><Skeleton className="mt-5 h-12" /><Skeleton className="mt-5 h-12" /></div>}
      {notificationsQuery.isError && <EmptyState className="mt-6" icon={Bell} title="Notifications could not be loaded" description="Please try again in a moment." actionLabel="Try again" onAction={() => notificationsQuery.refetch()} />}
      {notificationsQuery.isSuccess && visible.length === 0 && <EmptyState className="mt-6" icon={Bell} title="You’re all caught up" description="New application and job updates will appear here." />}
      {visible.length > 0 && <section className="surface-card mt-6 divide-y divide-[var(--cb-divider)]" aria-label="Applicant notifications">{visible.map((notification, index) => { const Icon = notificationIcons[index % notificationIcons.length]; const unread = isUnread(notification); return (
        <article key={notification.id} className={cn('flex gap-4 p-5', unread && 'bg-[var(--cb-primary-soft)]/45')}>
          <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', unread ? 'bg-[var(--cb-primary)] text-white' : 'bg-[var(--cb-bg-subtle)] text-[var(--cb-text-muted)]')}><Icon className="size-5" aria-hidden="true" /></span>
          <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-4"><div><h2 className="text-sm font-bold">{notification.title}</h2><p className="mt-1 text-sm leading-6 text-[var(--cb-text-secondary)]">{notification.message}</p></div>{unread && <span className="mt-1 size-2 shrink-0 rounded-full bg-[var(--cb-primary)]" aria-label="Unread" />}</div><div className="mt-3 flex items-center justify-between"><time className="text-xs text-[var(--cb-text-muted)]">{notification.time}</time>{unread && <button type="button" onClick={() => markNotificationRead(notification.id)} className="text-xs font-bold text-[var(--cb-primary)] hover:underline">Mark as read</button>}</div></div>
        </article>
      ); })}</section>}
      <p className="mt-4 text-xs leading-5 text-[var(--cb-text-muted)]">Notification state is stored only in this browser for the portfolio demonstration.</p>
    </div>
  );
}
