import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/src/store/useAppStore';

const roleHome = {
  applicant: '/applicant/dashboard',
  recruiter: '/recruiter/dashboard',
  admin: '/admin/dashboard',
};

export function RoleGuard({ allowedRole, children }) {
  const session = useAppStore((state) => state.session);
  const location = useLocation();

  if (!session) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (session.role !== allowedRole) return <Navigate to={roleHome[session.role] || '/'} replace />;
  return children;
}
