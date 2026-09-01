import { useMemo, useState } from 'react';
import { RotateCcw, Search, UserRoundX, UsersRound } from 'lucide-react';
import { Avatar } from '@/src/components/ui/Avatar';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/Feedback';
import { Modal, ModalContent } from '@/src/components/ui/Modal';
import { adminUsers } from '@/src/data/adminData';
import { useAppStore } from '@/src/store/useAppStore';

export function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All');
  const [accountState, setAccountState] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);
  const states = useAppStore((state) => state.adminUserStates);
  const setState = useAppStore((state) => state.setAdminUserState);
  const users = useMemo(() => adminUsers.filter((user) => {
    const current = states[user.id];
    const keyword = search.trim().toLocaleLowerCase();
    return (role === 'All' || user.role === role) && (accountState === 'All' || current === accountState) && (!keyword || [user.name, user.email].join(' ').toLocaleLowerCase().includes(keyword));
  }), [accountState, role, search, states]);

  function suspendUser() {
    if (!selectedUser) return;
    setState(selectedUser.id, 'Suspended');
    setSelectedUser(null);
  }

  return (
    <div>
      <header><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--cb-primary)]">Account oversight</p><h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Users</h1><p className="mt-2 text-sm text-[var(--cb-text-secondary)]">Filter fictional accounts by role and state, then record local moderation actions.</p></header>
      <section className="surface-card mt-7 grid gap-3 p-4 md:grid-cols-[1fr_180px_180px]"><label className="flex h-10 items-center gap-2 rounded-lg border bg-[var(--cb-surface)] px-3"><Search className="size-4 text-[var(--cb-text-muted)]" /><span className="sr-only">Search users</span><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search name or email" /></label><select aria-label="Filter user role" value={role} onChange={(event) => setRole(event.target.value)} className="h-10 rounded-lg border bg-[var(--cb-surface)] px-3 text-sm outline-none"><option>All</option><option>Applicant</option><option>Recruiter</option></select><select aria-label="Filter account state" value={accountState} onChange={(event) => setAccountState(event.target.value)} className="h-10 rounded-lg border bg-[var(--cb-surface)] px-3 text-sm outline-none"><option>All</option><option>Active</option><option>Suspended</option></select></section>
      {users.length === 0 && <EmptyState className="mt-6" icon={UsersRound} title="No users found" description="Try another role, state, or search term." />}
      {users.length > 0 && <div className="surface-card mt-6 overflow-hidden"><div className="hidden grid-cols-[1.25fr_0.7fr_0.65fr_0.7fr_130px] gap-4 border-b bg-[var(--cb-bg-subtle)] px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[var(--cb-text-muted)] lg:grid"><span>User</span><span>Role</span><span>Joined</span><span>State</span><span>Action</span></div><div className="divide-y divide-[var(--cb-divider)]">{users.map((user) => { const current = states[user.id]; return <article key={user.id} className="grid gap-4 p-5 lg:grid-cols-[1.25fr_0.7fr_0.65fr_0.7fr_130px] lg:items-center"><div className="flex min-w-0 items-center gap-3"><Avatar name={user.name} size="sm" /><div className="min-w-0"><h2 className="truncate text-sm font-bold">{user.name}</h2><p className="mt-1 truncate text-xs text-[var(--cb-text-muted)]">{user.email}</p></div></div><Badge variant="info" className="w-fit">{user.role}</Badge><p className="text-xs text-[var(--cb-text-secondary)]">{new Date(user.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p><Badge variant={current === 'Active' ? 'success' : 'danger'} className="w-fit">{current}</Badge>{current === 'Active' ? <Button size="sm" variant="dangerSoft" onClick={() => setSelectedUser(user)}><UserRoundX />Suspend</Button> : <Button size="sm" variant="secondary" onClick={() => setState(user.id, 'Active')}><RotateCcw />Reactivate</Button>}</article>; })}</div></div>}
      <Modal open={Boolean(selectedUser)} onOpenChange={(open) => !open && setSelectedUser(null)}><ModalContent title={`Suspend ${selectedUser?.name || 'this account'}?`} description="The fictional account will be marked suspended in local demo state. This can be reversed from the users table."><div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setSelectedUser(null)}>Cancel</Button><Button variant="danger" onClick={suspendUser}><UserRoundX />Suspend account</Button></div></ModalContent></Modal>
    </div>
  );
}
