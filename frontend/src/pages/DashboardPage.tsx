import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { requestsService } from '../services/requests';
import type { PurchaseRequest } from '../types';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

const CATEGORY_LABELS: Record<string, string> = {
  EQUIPMENT: 'Equipamentos',
  SERVICES: 'Serviços',
  SUPPLIES: 'Suprimentos',
  TRAVEL: 'Viagem',
  OTHER: 'Outros',
};

const APPROVER_ROLES = ['APPROVER', 'APPROVER_SENIOR', 'ADMIN'];

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

interface Metrics {
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<Metrics>({ pending: 0, approved: 0, rejected: 0, cancelled: 0 });
  const [recentRequests, setRecentRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const isApprover = user ? APPROVER_ROLES.includes(user.role) : false;

  useEffect(() => {
  setLoading(true);
  
  Promise.all([
    requestsService.list({ status: 'PENDING',   limit: 1 }),
    requestsService.list({ status: 'APPROVED',  limit: 1 }),
    requestsService.list({ status: 'REJECTED',  limit: 1 }),
    requestsService.list({ status: 'CANCELLED', limit: 1 }),
    requestsService.list({ limit: 5 }),
  ])
    .then(([pending, approved, rejected, cancelled, recent]) => {
      setMetrics({
        pending:   pending.meta.total,
        approved:  approved.meta.total,
        rejected:  rejected.meta.total,
        cancelled: cancelled.meta.total,
      });
      setRecentRequests(recent.data);
    })
    .catch(() => {
  toast.dismiss('dashboard-error');
  toast.error('Erro ao carregar o painel. Tente novamente.', { id: 'dashboard-error' });
})
    .finally(() => setLoading(false));
}, []);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Painel</h1>
          <p className="page-subtitle">Visão geral das solicitações</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-area">
          <div className="spinner" />
        </div>
      ) : (
        <div className={`dash-grid${isApprover ? ' dash-grid--with-sidebar' : ''}`}>
          <div className="dash-main">
            <div className="metrics-strip">
              <div className="metric-card metric-card--pending">
                <div className="metric-label">Pendentes</div>
                <div className="metric-value">{metrics.pending}</div>
              </div>
              <div className="metric-card metric-card--approved">
                <div className="metric-label">Aprovadas</div>
                <div className="metric-value">{metrics.approved}</div>
              </div>
              <div className="metric-card metric-card--rejected">
                <div className="metric-label">Rejeitadas</div>
                <div className="metric-value">{metrics.rejected}</div>
              </div>
              <div className="metric-card metric-card--cancelled">
                <div className="metric-label">Canceladas</div>
                <div className="metric-value">{metrics.cancelled}</div>
              </div>
            </div>

            <div className="dash-section">

              {recentRequests.length === 0 ? (
                <div className="empty-state" style={{ padding: '40px 24px' }}>
                  <p>Nenhuma solicitação encontrada.</p>
                </div>
              ) : (
                <div className="table-container">
                  <div className="table-toolbar">
                    <h2 className="section-title">Solicitações recentes</h2>
                    <Link to="/requests" className="section-link">Ver todas →</Link>
                  </div>
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
                      {recentRequests.map((req) => (
                        <tr key={req.id}>
                          <td><strong>{req.title}</strong></td>
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
                          <td><StatusBadge status={req.status} /></td>
                          <td>
                            <Link to={`/requests/${req.id}`} className="view-link">
                              Ver
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {isApprover && (
            <div className="dash-sidebar">
              <div className="approval-card">
                <h3 className="approval-card-title">Aguardando aprovação</h3>
                <div className="approval-card-count">{metrics.pending}</div>
                <div className="approval-card-label">
                  solicitação{metrics.pending !== 1 ? 'ões' : ''} pendente{metrics.pending !== 1 ? 's' : ''}
                </div>
                <Link to="/requests?status=PENDING" className="btn btn-orange approval-card-btn">
                  Revisar pendentes
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
