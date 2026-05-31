import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import type { Role } from '../types';

const ROLES: { value: Role; label: string }[] = [
  { value: 'REQUESTER',       label: 'Solicitante' },
  { value: 'APPROVER',        label: 'Aprovador' },
  { value: 'APPROVER_SENIOR', label: 'Aprovador Sênior' },
  { value: 'ADMIN',           label: 'Administrador' },
];

const schema = z.object({
  name:     z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email:    z.string().email('Informe um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  role:     z.enum(['REQUESTER', 'APPROVER', 'APPROVER_SENIOR', 'ADMIN']),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'REQUESTER' },
  });

  async function onSubmit(data: FormData) {
    try {
      await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      const message =
        err?.response?.data?.error ?? 'Erro ao criar conta. Tente novamente.';
      setError('root', { message });
    }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-logo">
            <span className="login-brand-king">Kingspan</span>
          </div>
          <h1 className="login-hero-title">
            Gestão de<br />Compras
          </h1>
          <p className="login-hero-description">
            Solicite, acompanhe e aprove requisições de compra
            em um fluxo único com rastreabilidade completa,
            aprovação por níveis e histórico de auditoria.
          </p>
        </div>
        <div className="login-footer">© 2026 Kingspan - Uso interno</div>
      </div>

      <div className="login-right">
        <div className="login-form-wrapper">
          <h1 className="login-title">Criar conta</h1>
          <p className="login-subtitle">Preencha os dados para acessar o sistema.</p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Nome completo</label>
              <input
                id="reg-name"
                type="text"
                className={`form-input login-input ${errors.name ? 'input-error' : ''}`}
                placeholder="Seu nome completo"
                autoComplete="name"
                {...register('name')}
              />
              {errors.name && (
                <span className="field-error">{errors.name.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">E-mail corporativo</label>
              <input
                id="reg-email"
                type="email"
                className={`form-input login-input ${errors.email ? 'input-error' : ''}`}
                placeholder="seu@email.com"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <span className="field-error">{errors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Senha</label>
              <input
                id="reg-password"
                type="password"
                className={`form-input login-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Crie uma senha"
                autoComplete="new-password"
                {...register('password')}
              />
              {errors.password && (
                <span className="field-error">{errors.password.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-role">Perfil</label>
              <select
                id="reg-role"
                className={`form-select login-select ${errors.role ? 'input-error' : ''}`}
                {...register('role')}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              {errors.role && (
                <span className="field-error">{errors.role.message}</span>
              )}
            </div>

            {errors.root && (
              <div className="form-error">{errors.root.message}</div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full login-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className="login-switch">
            Já tem conta?{' '}
            <Link to="/login" className="login-switch-link">Entrar</Link>
          </div>
        </div>
      </div>
    </div>
  );
}