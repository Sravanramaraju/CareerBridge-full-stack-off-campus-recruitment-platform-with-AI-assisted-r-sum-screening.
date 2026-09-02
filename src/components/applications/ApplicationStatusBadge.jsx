import { Badge } from '@/src/components/ui/Badge';

const variants = {
  Applied: 'primary',
  Screening: 'info',
  'Under Review': 'info',
  Assessment: 'warning',
  Shortlisted: 'success',
  Interview: 'warning',
  Offer: 'success',
  Offered: 'success',
  Rejected: 'danger',
  'Not selected': 'danger',
  Withdrawn: 'neutral',
};

export function ApplicationStatusBadge({ status, className }) {
  return <Badge variant={variants[status] || 'neutral'} className={className}>{status}</Badge>;
}
