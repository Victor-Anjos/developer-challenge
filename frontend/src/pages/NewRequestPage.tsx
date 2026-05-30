import { useState, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { requestsService } from '../services/requests';
import { useAuth } from '../contexts/AuthContext';
import type { RequestCategory } from '../types';

const CATEGORIES: { value: RequestCategory; label: string }[] = [
  { value: 'EQUIPMENT', label: 'Equipamentos' },
  { value: 'SERVICES',  label: 'Serviços' },
  { value: 'SUPPLIES',  label: 'Suprimentos' },
  { value: 'TRAVEL',    label: 'Viagem' },
  { value: 'OTHER',     label: 'Outros' },
];

type HintLevel = 'green' | 'amber' | 'red';

interface ApprovalHint {
  level: HintLevel;
  text: string;
}

function getApprovalHint(value: number): ApprovalHint | null {
  if (!value || value <= 0) return null;
  if (value <= 1000) return { level: 'green', text: '✓ Qualquer aprovador pode aprovar' };
  if (value <= 10000) return { level: 'amber', text: '⚠ Requer aprovador sênior ou administrador' };
  return { level: 'red', text: '⚑ Requer aprovação do administrador' };
}

export default function NewRequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<RequestCategory>('EQUIPMENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user?.role !== 'REQUESTER') {
    return <Navigate to="/dashboard" replace />;
  }

  const amountNum = parseFloat(amount.replace(',', '.'));
  const hint = isNaN(amountNum) ? null : getApprovalHint(amountNum);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Informe um valor válido maior que zero.');
      return;
    }

    setLoading(true);
    try {
      const req = await requestsService.create({ title, description, amount: amountNum, category });
      navigate(`/requests/${req.id}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Erro ao criar solicitação.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <div className="nr-title-row">
            <div className="nr-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div>
              <h1 className="page-title">Nova Solicitação</h1>
              <p className="page-subtitle">Preencha os dados da solicitação de compra</p>
            </div>
          </div>
        </div>
      </div>

      <div className="form-card-rich">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="form-section-title">Informações básicas</h3>

            <div className="form-group">
              <label className="form-label" htmlFor="title">Título</label>
              <input
                id="title"
                type="text"
                className="form-input"
                placeholder="Ex: Notebook Dell Inspiron"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={120}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Descrição</label>
              <textarea
                id="description"
                className="form-input form-textarea"
                placeholder="Descreva a necessidade e justificativa da compra…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Detalhes financeiros</h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="amount">Valor (R$)</label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                {hint && (
                  <div className={`approval-hint approval-hint--${hint.level}`}>
                    {hint.text}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="category">Categoria</label>
                <select
                  id="category"
                  className="form-input form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as RequestCategory)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/requests')}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Enviando…' : 'Enviar Solicitação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
