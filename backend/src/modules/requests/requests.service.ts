import { RequestStatus, RequestCategory, ApprovalLevel, Role } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { AppError } from '../../shared/errors/AppError';
import {
  assertTransitionAllowed,
  assertApprovalPermission,
  calculateApprovalLevel,
} from './state-machine';

interface CreateRequestInput {
  title: string;
  description: string;
  amount: number;
  category: RequestCategory;
  requesterId: string;
}

interface ListRequestsQuery {
  page?: string;
  limit?: string;
  status?: RequestStatus;
  requesterId?: string;
  role?: Role;
}

const REQUESTER_INCLUDE = {
  requester: { select: { id: true, name: true, email: true } },
};

export const requestsService = {
  async create({ title, description, amount, category, requesterId }: CreateRequestInput) {
    if (!title || !description || !amount || !category) {
      throw new AppError('Título, descrição, valor e categoria são obrigatórios.', 400);
    }

    if (amount <= 0) {
      throw new AppError('O valor deve ser maior que zero.', 400);
    }

    const approvalLevel = calculateApprovalLevel(amount) as ApprovalLevel;

    const request = await prisma.request.create({
      data: { title, description, amount, category, approvalLevel, requesterId },
      include: REQUESTER_INCLUDE,
    });

    await prisma.requestHistory.create({
      data: { requestId: request.id, userId: requesterId, action: 'CREATED', comment: null },
    });

    return request;
  },

  async list({ page, limit, status, requesterId, role }: ListRequestsQuery) {
    const pageNum  = Math.max(1, parseInt(page  ?? '1'));
    const limitNum = Math.min(50, parseInt(limit ?? '10'));
    const skip     = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (role === Role.REQUESTER) where.requesterId = requesterId;

    const [data, total] = await prisma.$transaction([
      prisma.request.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: REQUESTER_INCLUDE,
      }),
      prisma.request.count({ where }),
    ]);

    return {
      data,
      meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    };
  },

  async findById(id: string) {
    const request = await prisma.request.findUnique({
      where: { id },
      include: REQUESTER_INCLUDE,
    });

    if (!request) throw new AppError('Solicitação não encontrada.', 404);

    return request;
  },

  async approve(id: string, userId: string, role: Role, comment?: string) {
    const request = await this.findById(id);

    assertTransitionAllowed(request.status, 'approve');
    assertApprovalPermission(Number(request.amount), role);

    return prisma.$transaction(async (tx) => {
      await tx.request.update({
        where: { id },
        data: { status: RequestStatus.APPROVED },
      });

      await tx.requestHistory.create({
        data: { requestId: id, userId, action: 'APPROVED', comment },
      });

      return tx.request.findUnique({
        where: { id },
        include: REQUESTER_INCLUDE,
      });
    });
  },

  async reject(id: string, userId: string, role: Role, comment?: string) {
    const request = await this.findById(id);

    assertTransitionAllowed(request.status, 'reject');
    assertApprovalPermission(Number(request.amount), role);

    return prisma.$transaction(async (tx) => {
      await tx.request.update({
        where: { id },
        data: { status: RequestStatus.REJECTED },
      });

      await tx.requestHistory.create({
        data: { requestId: id, userId, action: 'REJECTED', comment },
      });

      return tx.request.findUnique({
        where: { id },
        include: REQUESTER_INCLUDE,
      });
    });
  },

  async cancel(id: string, userId: string, role: Role, comment?: string) {
    const request = await this.findById(id);

    assertTransitionAllowed(request.status, 'cancel');

    if (role !== Role.ADMIN && request.requesterId !== userId) {
      throw new AppError('Apenas o solicitante ou administrador pode cancelar esta solicitação.', 403);
    }

    return prisma.$transaction(async (tx) => {
      await tx.request.update({
        where: { id },
        data: { status: RequestStatus.CANCELLED },
      });

      await tx.requestHistory.create({
        data: { requestId: id, userId, action: 'CANCELLED', comment },
      });

      return tx.request.findUnique({
        where: { id },
        include: REQUESTER_INCLUDE,
      });
    });
  },

  async history(id: string) {
    await this.findById(id);

    return prisma.requestHistory.findMany({
      where: { requestId: id },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  },
};