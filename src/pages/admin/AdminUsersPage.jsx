import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RotateCcw, Search, UserRoundX, UsersRound } from 'lucide-react';
import { Avatar } from '@/src/components/ui/Avatar';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { EmptyState, Skeleton } from '@/src/components/ui/Feedback';
import { TextArea } from '@/src/components/ui/Input';
import { Modal, ModalContent } from '@/src/components/ui/Modal';
import { Pagination } from '@/src/components/ui/Pagination';
import { useToast } from '@/src/components/feedback/ToastProvider';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';
import { adminService } from '@/src/services/adminService';
import { queryKeys } from '@/src/services/queryKeys';
import { useAppStore } from '@/src/store/useAppStore';

const roleOptions = [['', 'All roles'], ['APPLICANT', 'Applicant'], ['RECRUITER', 'Recruiter'], ['ADMIN', 'Admin']];
const statusOptions = [['', 'All account states'], ['ACTIVE', 'Active'], ['SUSPENDED', 'Suspended'], ['DEACTIVATED', 'Deactivated']];

export function AdminUsersPage() {
  useDocumentTitle('User administration');
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const sessionUserId = useAppStore((state) => state.session?.id);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [accountStatus, setAccountStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reason, setReason] = useState('');
  const filters = useMemo(() => ({
    q: search.trim() || undefined,
    role: role || undefined,
    status: accountStatus || undefined,
    page,
    pageSize: 20,
  }), [accountStatus, page, role, search]);
  const usersQuery = useQuery({
    queryKey: queryKeys.adminUsers(filters),
    queryFn: ({ signal }) => adminService.getUsers(filters, { signal }),
  });
  const statusMutation = useMutation({
    mutationFn: ({ user, status, statusReason }) => adminService.updateUserStatus(user.id, status, statusReason),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.adminUsers(filters), (current) => current ? {
        ...current, items: current.items.map((user) => user.id === updated.id ? updated : user),
      } : current);
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard() });
      setSelectedUser(null);
      setReason('');
      showToast(`${updated.name}'s account is now ${updated.statusLabel.toLowerCase()}.`);
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Unable to update the account status.', { tone: 'error' }),
  });
  const users = usersQuery.data?.items || [];
  const pagination = usersQuery.data?.pagination;

  function updateFilter(setter, value) { setter(value); setPage(1); }
  function suspendUser() {
    if (!selectedUser || reason.trim().length < 3) return;
    statusMutation.mutate({ user: selectedUser, status: 'SUSPENDED', statusReason: reason });
  }

  return (
    <div>
      <header><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--cb-primary)]">Account oversight</p><h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.035em]">Users</h1><p className="mt-2 text-sm text-[var(--cb-text-secondary)]">Review account access and record audited suspension or reactivation decisions.</p></header>
      <section className="surface-card mt-7 grid gap-3 p-4 md:grid-cols-[1fr_180px_180px]" aria-label="User filters"><label className="flex h-10 items-center gap-2 rounded-lg border bg-[var(--cb-surface)] px-3"><Search className="size-4 text-[var(--cb-text-muted)]" /><span className="sr-only">Search users</span><input value={search} onChange={(event) => updateFilter(setSearch, event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search name or email" /></label><select aria-label="Filter user role" value={role} onChange={(event) => updateFilter(setRole, event.target.value)} className="h-10 rounded-lg border bg-[var(--cb-surface)] px-3 text-sm outline-none">{roleOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select aria-label="Filter account state" value={accountStatus} onChange={(event) => updateFilter(setAccountStatus, event.target.value)} className="h-10 rounded-lg border bg-[var(--cb-surface)] px-3 text-sm outline-none">{statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></section>
      {usersQuery.isLoading && <div className="mt-6 grid gap-3">{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-24" />)}</div>}
      {usersQuery.isError && <EmptyState className="mt-6" icon={UsersRound} title="Users could not be loaded" description="Please try again in a moment." actionLabel="Try again" onAction={() => usersQuery.refetch()} />}
      {usersQuery.isSuccess && users.length === 0 && <EmptyState className="mt-6" icon={UsersRound} title="No users found" description="Try another role, state, or search term." />}
      {users.length > 0 && <div className="surface-card mt-6 overflow-hidden"><div className="hidden grid-cols-[1.25fr_0.7fr_0.65fr_0.7fr_140px] gap-4 border-b bg-[var(--cb-bg-subtle)] px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[var(--cb-text-muted)] lg:grid"><span>User</span><span>Role</span><span>Joined</span><span>State</span><span>Action</span></div><div className="divide-y divide-[var(--cb-divider)]">{users.map((user) => <article key={user.id} className="grid gap-4 p-5 lg:grid-cols-[1.25fr_0.7fr_0.65fr_0.7fr_140px] lg:items-center"><div className="flex min-w-0 items-center gap-3"><Avatar name={user.name} size="sm" /><div className="min-w-0"><h2 className="truncate text-sm font-bold">{user.name}</h2><p className="mt-1 truncate text-xs text-[var(--cb-text-muted)]">{user.email}</p></div></div><Badge variant="info" className="w-fit">{user.roleLabel}</Badge><p className="text-xs text-[var(--cb-text-secondary)]">{new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p><Badge variant={user.status === 'ACTIVE' ? 'success' : 'danger'} className="w-fit">{user.statusLabel}</Badge>{user.status === 'ACTIVE' ? <Button size="sm" variant="dangerSoft" disabled={statusMutation.isPending || user.id === sessionUserId} title={user.id === sessionUserId ? 'You cannot suspend your own administrator account.' : undefined} onClick={() => setSelectedUser(user)}><UserRoundX />Suspend</Button> : user.status === 'SUSPENDED' ? <Button size="sm" variant="secondary" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate({ user, status: 'ACTIVE' })}><RotateCcw />Reactivate</Button> : <span className="text-xs text-[var(--cb-text-muted)]">No action available</span>}</article>)}</div></div>}
      {pagination && <Pagination currentPage={pagination.page} pageCount={pagination.totalPages} onPageChange={setPage} />}

      <Modal open={Boolean(selectedUser)} onOpenChange={(open) => { if (!open) { setSelectedUser(null); setReason(''); } }}><ModalContent title={`Suspend ${selectedUser?.name || 'this account'}?`} description="Active sessions will be revoked immediately. Provide a clear reason for the user notification and audit record."><TextArea value={reason} onChange={(event) => setReason(event.target.value)} minLength={3} maxLength={500} aria-label="User suspension reason" placeholder="Explain why access is being suspended…" /><div className="mt-4 flex justify-end gap-2"><Button variant="secondary" onClick={() => { setSelectedUser(null); setReason(''); }}>Cancel</Button><Button variant="danger" disabled={reason.trim().length < 3 || statusMutation.isPending} onClick={suspendUser}>{statusMutation.isPending ? 'Suspending…' : 'Suspend account'}</Button></div></ModalContent></Modal>
    </div>
  );
}
