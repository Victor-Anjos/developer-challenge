export type Role = 'REQUESTER' | 'APPROVER' | 'APPROVER_SENIOR' | 'ADMIN';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type RequestCategory = 'EQUIPMENT' | 'SERVICES' | 'SUPPLIES' | 'TRAVEL' | 'OTHER';
export type ApprovalLevel = 'NIVEL_1' | 'NIVEL_2' | 'NIVEL_3';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface PurchaseRequest {
  id: string;
  title: string;
  description: string;
  amount: string;
  category: RequestCategory;
  status: RequestStatus;
  approvalLevel: ApprovalLevel;
  createdAt: string;
  updatedAt: string;
  requesterId: string;
  requester: {
    id: string;
    name: string;
    email: string;
  };
}

export interface RequestHistoryEntry {
  id: string;
  action: string;
  comment: string | null;
  createdAt: string;
  requestId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
}
