import { useState } from 'react';
import { Bell, BriefcaseBusiness, CalendarClock, CheckCheck, UsersRound } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/Feedback';
import { recruiterNotifications } from '@/src/data/mockData';
import { useAppStore } from '@/src/store/useAppStore';
import { cn } from '@/src/lib/utils';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';

const notificationIcons = [UsersRound, CalendarClock, BriefcaseBusiness, CalendarClock, BriefcaseBusiness, UsersRound];

export function RecruiterNotificationsPage() {
  useDocumentTitle('Recruiter notifications');
  const [filter, setFilter] = useState('All');
  const readIds = useAppStore((state) => state.readNotificationIds);
  const markNotificationRead = useAppStore((state) => state.markNotificationRead);
  const markAllNotificationsRead = useAppStore((state) => state.markAllNotificationsRead);
  const isUnread = (notification) => !notification.read && !readIds.includes(notification.id);
  const unreadCount = recruiterNotifications.filter(isUnread).length;
  const visible = filter === 'Unread' ? recruiterNotifications.filter(isUnread) : recruiterNotifications;

  return (
    <div className="max-w-4xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--cb-primary)]">Hiring updates</p><h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Notifications</h1><p className="mt-2 text-sm text-[var(--cb-text-secondary)]">Keep candidate actions and role deadlines visible.</p></div>{unreadCount > 0 && <Button variant="secondary" onClick={() => markAllNotificationsRead(recruiterNotifications.map((item) => item.id))}><CheckCheck />Mark all read</Button>}</header>

      <div className="mt-7 flex gap-1 border-b border-[var(--cb-divider)] pb-3" role="tablist" aria-label="Notification filter">{['All', 'Unread'].map((label) => <button key={label} type="button" role="tab" aria-selected={filter === label} onClick={() => setFilter(label)} className={cn('rounded-lg px-4 py-2 text-sm font-bold', filter === label ? 'bg-[var(--cb-primary-soft)] text-[var(--cb-primary)]' : 'text-[var(--cb-text-secondary)] hover:bg-[var(--cb-bg-subtle)]')}>{label}{label === 'Unread' && <span className="ml-2 text-xs">{unreadCount}</span>}</button>)}</div>

      {visible.length === 0 && <EmptyState className="mt-6" icon={Bell} title="You’re all caught up" description="New candidate and job updates will appear here." />}
      {visible.length > 0 && <section className="surface-card mt-6 divide-y divide-[var(--cb-divider)]" aria-label="Recruiter notifications">{visible.map((notification, index) => { const Icon = notificationIcons[index]; const unread = isUnread(notification); return (
        <article key={notification.id} className={cn('flex gap-4 p-5', unread && 'bg-[var(--cb-primary-soft)]/45')}>
          <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', unread ? 'bg-[var(--cb-primary)] text-white' : 'bg-[var(--cb-bg-subtle)] text-[var(--cb-text-muted)]')}><Icon className="size-5" /></span>
          <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-4"><div><h2 className="text-sm font-bold">{notification.title}</h2><p className="mt-1 text-sm leading-6 text-[var(--cb-text-secondary)]">{notification.message}</p></div>{unread && <span className="mt-1 size-2 shrink-0 rounded-full bg-[var(--cb-primary)]" aria-label="Unread" />}</div><div className="mt-3 flex items-center justify-between"><time className="text-xs text-[var(--cb-text-muted)]">{notification.time}</time>{unread && <button type="button" onClick={() => markNotificationRead(notification.id)} className="text-xs font-bold text-[var(--cb-primary)] hover:underline">Mark as read</button>}</div></div>
        </article>
      ); })}</section>}
      <p className="mt-4 text-xs leading-5 text-[var(--cb-text-muted)]">Notification state is stored only in this browser for the portfolio demonstration.</p>
    </div>
  );
}
