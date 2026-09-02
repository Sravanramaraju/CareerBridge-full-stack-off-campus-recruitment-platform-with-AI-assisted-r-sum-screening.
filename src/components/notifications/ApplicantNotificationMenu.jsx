import { Bell, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockNotifications } from '@/src/data/mockData';
import { cn } from '@/src/lib/utils';
import { useAppStore } from '@/src/store/useAppStore';

export function ApplicantNotificationMenu() {
  const readIds = useAppStore((state) => state.readNotificationIds);
  const markNotificationRead = useAppStore((state) => state.markNotificationRead);
  const unreadCount = mockNotifications.filter((item) => !item.read && !readIds.includes(item.id)).length;

  return (
    <details className="relative">
      <summary className="relative grid size-10 cursor-pointer list-none place-items-center rounded-lg text-[var(--cb-text-secondary)] hover:bg-[var(--cb-bg-subtle)]" aria-label={`${unreadCount} unread notifications`}>
        <Bell className="size-5" aria-hidden="true" />
        {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[var(--cb-danger)]" />}
      </summary>
      <div className="absolute right-0 mt-2 hidden w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border bg-[var(--cb-surface-raised)] shadow-[var(--cb-shadow-raised)] sm:block">
        <div className="flex items-center justify-between border-b border-[var(--cb-divider)] px-4 py-3"><h2 className="text-sm font-bold">Notifications</h2><span className="text-xs text-[var(--cb-text-muted)]">{unreadCount} unread</span></div>
        <div className="divide-y divide-[var(--cb-divider)]">{mockNotifications.slice(0, 4).map((notification) => { const unread = !notification.read && !readIds.includes(notification.id); return (
          <article key={notification.id} className={cn('p-4', unread && 'bg-[var(--cb-primary-soft)]/45')}>
            <div className="flex items-start gap-3"><span className={cn('mt-1 size-2 shrink-0 rounded-full', unread ? 'bg-[var(--cb-primary)]' : 'bg-transparent')} /><div className="min-w-0 flex-1"><h3 className="text-xs font-bold">{notification.title}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--cb-text-secondary)]">{notification.message}</p><div className="mt-2 flex items-center justify-between gap-3"><time className="text-[10px] text-[var(--cb-text-muted)]">{notification.time}</time>{unread && <button type="button" onClick={() => markNotificationRead(notification.id)} className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--cb-primary)]"><Check className="size-3" />Mark read</button>}</div></div></div>
          </article>
        ); })}</div>
        <Link to="/applicant/notifications" className="block border-t border-[var(--cb-divider)] px-4 py-3 text-center text-xs font-bold text-[var(--cb-primary)] hover:bg-[var(--cb-bg-subtle)]">View all notifications</Link>
      </div>
    </details>
  );
}
