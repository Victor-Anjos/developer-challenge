import type { RequestStatus } from '../types';

const config: Record<RequestStatus, { label: string; className: string }> = {
  PENDING:   { label: 'Pendente',   className: 'badge badge-pending' },
  APPROVED:  { label: 'Aprovada',   className: 'badge badge-approved' },
  REJECTED:  { label: 'Rejeitada',  className: 'badge badge-rejected' },
  CANCELLED: { label: 'Cancelada',  className: 'badge badge-cancelled' },
};

export default function StatusBadge({ status }: { status: RequestStatus }) {
  const { label, className } = config[status];
  return <span className={className}>{label}</span>;
}
