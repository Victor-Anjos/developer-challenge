import api from './api';
import type {
  PurchaseRequest,
  RequestHistoryEntry,
  PaginatedResponse,
  ApiResponse,
  RequestStatus,
  RequestCategory,
} from '../types';

interface CreateRequestPayload {
  title: string;
  description: string;
  amount: number;
  category: RequestCategory;
}

interface ListRequestsParams {
  page?: number;
  limit?: number;
  status?: RequestStatus | '';
}

export const requestsService = {
  async list(params: ListRequestsParams = {}): Promise<PaginatedResponse<PurchaseRequest>> {
    const query: Record<string, string> = {
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 10),
    };
    if (params.status) query.status = params.status;

    const { data } = await api.get<PaginatedResponse<PurchaseRequest>>('/requests', { params: query });
    return data;
  },

  async findById(id: string): Promise<PurchaseRequest> {
    const { data } = await api.get<ApiResponse<PurchaseRequest>>(`/requests/${id}`);
    return data.data;
  },

  async create(payload: CreateRequestPayload): Promise<PurchaseRequest> {
    const { data } = await api.post<ApiResponse<PurchaseRequest>>('/requests', payload);
    return data.data;
  },

  async approve(id: string, comment?: string): Promise<PurchaseRequest> {
    const { data } = await api.patch<ApiResponse<PurchaseRequest>>(`/requests/${id}/approve`, { comment });
    return data.data;
  },

  async reject(id: string, comment?: string): Promise<PurchaseRequest> {
    const { data } = await api.patch<ApiResponse<PurchaseRequest>>(`/requests/${id}/reject`, { comment });
    return data.data;
  },

  async cancel(id: string, comment?: string): Promise<PurchaseRequest> {
    const { data } = await api.patch<ApiResponse<PurchaseRequest>>(`/requests/${id}/cancel`, { comment });
    return data.data;
  },

  async history(id: string): Promise<RequestHistoryEntry[]> {
    const { data } = await api.get<ApiResponse<RequestHistoryEntry[]>>(`/requests/${id}/history`);
    return data.data;
  },
};
