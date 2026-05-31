import { useWatch } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

const schema = z.object({
  title:       z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  amount: z.string()
  .min(1, 'Informe um valor')
  .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'O valor deve ser maior que zero'),
  category:    z.enum(['EQUIPMENT', 'SERVICES', 'SUPPLIES', 'TRAVEL', 'OTHER']),
});

type FormData = z.infer<typeof schema>;

function getApprovalHint(value: number) {
  if (!value || value <= 0) return null;
  if (value <= 1000)  return { level: 'green', text: 'Qualquer aprovador pode aprovar' };
  if (value <= 10000) return { level: 'amber', text: 'Requer aprovador sênior ou administrador' };
  return { level: 'red', text: 'Requer aprovação do administrador' };
}

function ApprovalHint({ control }: { control: any }) {
  const amount = useWatch({ control, name: 'amount' });
  const hint = getApprovalHint(Number(amount));
  if (!hint) return null;
  return (
    <div className={`approval-hint approval-hint--${hint.level}`}>
      {hint.text}
    </div>
  );
}

export default function NewRequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'EQUIPMENT' },
  });

  if (user?.role !== 'REQUESTER') {
    return <Navigate to="/dashboard" replace />;
  }

  async function onSubmit(data: FormData) {
    try {
      const req = await requestsService.create({
        title:       data.title,
        description: data.description,
        amount: parseFloat(data.amount),
        category:    data.category as RequestCategory,
      });
      navigate(`/requests/${req.id}`);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Erro ao criar solicitação.';
      setError('root', { message: msg });
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <div className="nr-title-row">
            <div>
              <h1 className="page-title">Nova Solicitação</h1>
              <p className="page-subtitle">Preencha os dados da solicitação de compra</p>
            </div>
          </div>
        </div>
      </div>

      <div className="form-card-rich">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-section">
            <h3 className="form-section-title">Informações básicas</h3>

            <div className="form-group">
              <label className="form-label" htmlFor="title">Título</label>
              <input
                id="title"
                type="text"
                className={`form-input ${errors.title ? 'input-error' : ''}`}
                placeholder="Ex: Notebook Dell Inspiron"
                maxLength={120}
                {...register('title')}
              />
              {errors.title && <span className="field-error">{errors.title.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Descrição</label>
              <textarea
                id="description"
                className={`form-input form-textarea ${errors.description ? 'input-error' : ''}`}
                placeholder="Descreva a necessidade e justificativa da compra…"
                rows={4}
                {...register('description')}
              />
              {errors.description && <span className="field-error">{errors.description.message}</span>}
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
                  className={`form-input ${errors.amount ? 'input-error' : ''}`}
                  placeholder="0,00"
                  {...register('amount')}
                />
                {errors.amount && <span className="field-error">{errors.amount.message}</span>}
                <ApprovalHint control={control} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="category">Categoria</label>
                <select
                  id="category"
                  className={`form-input form-select ${errors.category ? 'input-error' : ''}`}
                  {...register('category')}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                {errors.category && <span className="field-error">{errors.category.message}</span>}
              </div>
            </div>
          </div>

          {errors.root && <div className="form-error">{errors.root.message}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/requests')}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando…' : 'Enviar Solicitação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}