import { RequestStatus, Role } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError';

type Transition = 'approve' | 'reject' | 'cancel';

const VALID_TRANSITIONS: Record<Transition, RequestStatus[]> = {
  approve: [RequestStatus.PENDING],
  reject:  [RequestStatus.PENDING],
  cancel:  [RequestStatus.PENDING],
};

const TRANSITION_MESSAGES: Record<string, string> = {
  'approve:APPROVED':  'Não é possível aprovar uma solicitação já aprovada.',
  'approve:REJECTED':  'Não é possível aprovar uma solicitação já rejeitada.',
  'approve:CANCELLED': 'Não é possível aprovar uma solicitação já cancelada.',
  'reject:APPROVED':   'Não é possível rejeitar uma solicitação já aprovada.',
  'reject:REJECTED':   'Não é possível rejeitar uma solicitação já rejeitada.',
  'reject:CANCELLED':  'Não é possível rejeitar uma solicitação já cancelada.',
  'cancel:APPROVED':   'Não é possível cancelar uma solicitação já aprovada.',
  'cancel:REJECTED':   'Não é possível cancelar uma solicitação já rejeitada.',
  'cancel:CANCELLED':  'Não é possível cancelar uma solicitação já cancelada.',
};

export function assertTransitionAllowed(
  current: RequestStatus,
  transition: Transition,
): void {
  const allowed = VALID_TRANSITIONS[transition];

  if (!allowed.includes(current)) {
    const key = `${transition}:${current}`;
    const message = TRANSITION_MESSAGES[key] ?? 'Transição de estado inválida.';
    throw new AppError(message, 422);
  }
}

export function calculateApprovalLevel(amount: number) {
  if (amount <= 1000) return 'NIVEL_1';
  if (amount <= 10000) return 'NIVEL_2';
  return 'NIVEL_3';
}

export function assertApprovalPermission(
  amount: number,
  role: Role,
): void {
  const level = calculateApprovalLevel(amount);

  if (level === 'NIVEL_1') return;

  if (level === 'NIVEL_2' && role === Role.APPROVER) {
    throw new AppError(
      'Solicitações entre R$ 1.000,01 e R$ 10.000,00 exigem aprovador sênior ou administrador.',
      403,
    );
  }

  if (level === 'NIVEL_3' && role !== Role.ADMIN) {
    throw new AppError(
      'Solicitações acima de R$ 10.000,00 exigem aprovação do administrador.',
      403,
    );
  }
}