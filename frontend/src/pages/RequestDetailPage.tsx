import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { requestsService } from '../services/requests';
import type { PurchaseRequest, RequestHistoryEntry } from '../types';
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

const LEVEL_INFO: Record<string, { label: string; tier: string }> = {
  NIVEL_1: { label: 'Qualquer aprovador', tier: '1' },
  NIVEL_2: { label: 'Aprovador sênior',   tier: '2' },
  NIVEL_3: { label: 'Administrador',      tier: '3' },
};

const ACTION_LABELS: Record<string, string> = {
  CREATED:   'Criada',
  APPROVED:  'Aprovada',
  REJECTED:  'Rejeitada',
  CANCELLED: 'Cancelada',
};

const ROLE_LABELS: Record<string, string> = {
  REQUESTER:       'Solicitante',
  APPROVER:        'Aprovador',
  APPROVER_SENIOR: 'Aprovador Sênior',
  ADMIN:           'Administrador',
};

function formatCurrency(value: string) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(value));
}

function canApproveOrReject(request: PurchaseRequest, role: string): boolean {
  if (request.status !== 'PENDING') return false;
  if (!['APPROVER', 'APPROVER_SENIOR', 'ADMIN'].includes(role)) return false;
  const amount = Number(request.amount);
  if (amount <= 1000) return true;
  if (amount <= 10000) return role === 'APPROVER_SENIOR' || role === 'ADMIN';
  return role === 'ADMIN';
}

function canCancel(request: PurchaseRequest, userId: string, role: string): boolean {
  if (request.status !== 'PENDING') return false;
  if (role === 'ADMIN') return true;
  return role === 'REQUESTER' && request.requesterId === userId;
}

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState<PurchaseRequest | null>(null);
  const [history, setHistory] = useState<RequestHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | 'cancel' | null>(null);
  const [comment, setComment] = useState('');
  const [actionError, setActionError] = useState('');
  const [showCommentFor, setShowCommentFor] = useState<'approve' | 'reject' | 'cancel' | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([requestsService.findById(id), requestsService.history(id)])
      .then(([req, hist]) => { setRequest(req); setHistory(hist); })
      .catch(() => setError('Solicitação não encontrada.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function executeAction(action: 'approve' | 'reject' | 'cancel') {
  if (!id) return;
  setActionError('');
  setActionLoading(action);
  try {
    let updated: PurchaseRequest;
    if (action === 'approve')      updated = await requestsService.approve(id, comment || undefined);
    else if (action === 'reject')  updated = await requestsService.reject(id, comment || undefined);
    else                           updated = await requestsService.cancel(id, comment || undefined);

    setRequest(updated);
    const hist = await requestsService.history(id);
    setHistory(hist);
    setComment('');
    setShowCommentFor(null);

    const successMessages = {
      approve: 'Solicitação aprovada com sucesso!',
      reject:  'Solicitação rejeitada.',
      cancel:  'Solicitação cancelada.',
    };
    toast.success(successMessages[action]);

  } catch (err: any) {
    const msg = err?.response?.data?.error ?? 'Erro ao executar ação.';
    setActionError(msg);
    toast.error(msg, { id: 'action-error' });
  } finally {
    setActionLoading(null);
  }
}

  function startAction(action: 'approve' | 'reject' | 'cancel') {
    setActionError('');
    setComment('');
    setShowCommentFor(action);
  }

  if (loading) return (
    <div className="page"><div className="loading-area"><div className="spinner" /></div></div>
  );

  if (error || !request) return (
    <div className="page"><div className="alert alert-error">{error || 'Solicitação não encontrada.'}</div></div>
  );

  const showApproveReject = user && canApproveOrReject(request, user.role);
  const showCancel        = user && canCancel(request, user.id, user.role);
  const showActionsCard   = user && (
    ['APPROVER', 'APPROVER_SENIOR', 'ADMIN'].includes(user.role) ||
    (user.role === 'REQUESTER' && request.requesterId === user.id)
  );

  const level = LEVEL_INFO[request.approvalLevel] ?? { label: request.approvalLevel, tier: '1' };

  return (
    <div className="page">
      <div className="detail-page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Voltar
        </button>
        <h1 className="detail-page-title">{request.title}</h1>
        <div className="detail-page-header-right">
          <StatusBadge status={request.status} />
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main">

         
          <div className="detail-card">
            <h2 className="detail-title">{request.title}</h2>
            {request.description && (
              <p className="detail-description">{request.description}</p>
            )}

            <div className="detail-meta-grid">
              
              <div className="detail-meta-item">
                <span className="detail-meta-label">Valor</span>
                <span className="detail-amount">{formatCurrency(request.amount)}</span>
              </div>
              <div className="detail-meta-item">
                <span className="detail-meta-label">Categoria</span>
                <span className="category-badge detail-meta-badge">
                  {CATEGORY_LABELS[request.category]}
                </span>
              </div>
              <div className="detail-meta-item">
                <span className="detail-meta-label">Nível de aprovação</span>
                <span className={`detail-level-badge detail-level-badge--${level.tier}`}>
                  {level.label}
                </span>
              </div>

              
              <div className="detail-meta-item">
                <span className="detail-meta-label">Solicitante</span>
                <div className="detail-requester-cell">
                  <div className="detail-requester-avatar">
                    {request.requester.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="detail-meta-value">{request.requester.name}</span>
                </div>
              </div>
              <div className="detail-meta-item">
                <span className="detail-meta-label">Criada em</span>
                <span className="detail-meta-value">{formatDateTime(request.createdAt)}</span>
              </div>
              <div className="detail-meta-item">
                <span className="detail-meta-label">Atualizada em</span>
                <span className="detail-meta-value">{formatDateTime(request.updatedAt)}</span>
              </div>
            </div>
          </div>

          
          {showActionsCard && (
            <div className="action-card">
              <h3 className="action-card-title">Ações disponíveis</h3>

              {request.status !== 'PENDING' ? (
                <div className="detail-status-info">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Esta solicitação foi{' '}
                  <strong>{ACTION_LABELS[request.status]?.toLowerCase() ?? 'encerrada'}</strong>
                  {' '}e não pode mais ser alterada.
                </div>
              ) : showCommentFor ? (
                <div className="action-comment-form">
                  <label className="form-label">Comentário (opcional)</label>
                  <textarea
                    className="form-input form-textarea"
                    rows={3}
                    placeholder="Adicione um comentário…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  {actionError && <div className="form-error">{actionError}</div>}
                  <div className="action-buttons">
                    <button
                      className="btn btn-outline"
                      onClick={() => { setShowCommentFor(null); setActionError(''); }}
                      disabled={!!actionLoading}
                    >
                      Voltar
                    </button>
                    <button
                      className={`btn ${
                        showCommentFor === 'approve' ? 'btn-approve'
                        : showCommentFor === 'reject' ? 'btn-reject'
                        : 'btn-cancel-action'
                      }`}
                      onClick={() => executeAction(showCommentFor)}
                      disabled={!!actionLoading}
                    >
                      {actionLoading
                        ? 'Processando…'
                        : showCommentFor === 'approve' ? 'Confirmar Aprovação'
                        : showCommentFor === 'reject'  ? 'Confirmar Rejeição'
                        : 'Confirmar Cancelamento'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="action-buttons">
                  {showApproveReject && (
                    <>
                      <button className="btn btn-approve" onClick={() => startAction('approve')}>
                        Aprovar
                      </button>
                      <button className="btn btn-reject" onClick={() => startAction('reject')}>
                        Rejeitar
                      </button>
                    </>
                  )}
                  {showCancel && (
                    <button className="btn btn-cancel-action" onClick={() => startAction('cancel')}>
                      Cancelar Solicitação
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        
        <div className="detail-sidebar">
          <div className="detail-card">
            <h3 className="history-title">Histórico de ações</h3>
            {history.length === 0 ? (
              <p className="detail-meta-value" style={{ color: 'var(--muted)' }}>
                Nenhuma ação registrada.
              </p>
            ) : (
              <ul className="history-list">
                {history.map((entry, i) => (
                  <li
                    key={entry.id}
                    className={`history-item${i === history.length - 1 ? ' last' : ''}`}
                  >
                    <div className="history-dot" data-action={entry.action} />
                    <div className="history-content">
                      <div className="history-action">
                        {ACTION_LABELS[entry.action] ?? entry.action}
                      </div>
                      <div className="history-by">
                        {entry.user.name}
                        <span className="history-role">
                          {' '}· {ROLE_LABELS[entry.user.role] ?? entry.user.role}
                        </span>
                      </div>
                      {entry.comment && (
                        <p className="history-comment">"{entry.comment}"</p>
                      )}
                      <time className="history-time">{formatDateTime(entry.createdAt)}</time>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
