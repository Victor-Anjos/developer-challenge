import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { requestsService } from '../services/requests';
import type { PurchaseRequest, RequestStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

const CATEGORY_LABELS: Record<string, string> = {
  EQUIPMENT: 'Equipamentos',
  SERVICES:  'Serviços',
  SUPPLIES:  'Suprimentos',
  TRAVEL:    'Viagem',
  OTHER:     'Outros',
};

const STATUS_FILTERS: { value: RequestStatus | ''; label: string }[] = [
  { value: '',          label: 'Todos' },
  { value: 'PENDING',   label: 'Pendentes' },
  { value: 'APPROVED',  label: 'Aprovadas' },
  { value: 'REJECTED',  label: 'Rejeitadas' },
  { value: 'CANCELLED', label: 'Canceladas' },
];

function formatCurrency(value: string) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export default function RequestsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialStatus = (searchParams.get('status') as RequestStatus | null) ?? '';

  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [status, setStatus] = useState<RequestStatus | ''>(initialStatus);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    requestsService
      .list({ page, status })
      .then((res) => {
        setRequests(res.data);
        setTotalPages(res.meta.totalPages);
      })
      .catch(() => toast.error('Erro ao carregar solicitações.', { id: 'requests-error' }))
      .finally(() => setLoading(false));
  }, [page, status]);

  const handleStatusChange = (value: RequestStatus | '') => {
    setStatus(value);
    setPage(1);
  };

  const pageTitle = user?.role === 'REQUESTER' ? 'Minhas Solicitações' : 'Todas as Solicitações';

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">{pageTitle}</h1>
          <p className="page-subtitle">Gerencie e acompanhe todas as solicitações de compra</p>
        </div>
        {user?.role === 'REQUESTER' && (
          <Link to="/requests/new" className="btn btn-primary">
            + Nova Solicitação
          </Link>
        )}
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <h2 className="table-toolbar-title">Solicitações</h2>
          <div className="filter-bar filter-bar--flat">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                className={`filter-btn ${status === f.value ? 'active' : ''}`}
                onClick={() => handleStatusChange(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-area">
            <div className="spinner" />
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma solicitação encontrada.</p>
            {user?.role === 'REQUESTER' && (
              <Link to="/requests/new" className="btn btn-primary" style={{ marginTop: 16 }}>
                Criar primeira solicitação
              </Link>
            )}
          </div>
        ) : (
          <table className="requests-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoria</th>
                <th>Valor</th>
                <th>Solicitante</th>
                <th>Data</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td className="table-cell-title">
                    <strong>{req.title}</strong>
                  </td>
                  <td>
                    <span className="category-badge">{CATEGORY_LABELS[req.category]}</span>
                  </td>
                  <td>{formatCurrency(req.amount)}</td>
                  <td>
                    <div className="requester-info">
                      <div className="requester-avatar">
                        {req.requester.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="requester-name">{req.requester.name}</span>
                    </div>
                  </td>
                  <td>{formatDate(req.createdAt)}</td>
                  <td>
                    <StatusBadge status={req.status} />
                  </td>
                  <td>
                    <Link to={`/requests/${req.id}`} className="view-link">
                      Ver detalhes
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </button>
          <span className="pagination-info">
            Página {page} de {totalPages}
          </span>
          <button
            className="btn btn-outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}