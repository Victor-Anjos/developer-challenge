import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Role } from '../types';

const ROLES: { value: Role; label: string }[] = [
  { value: 'REQUESTER',       label: 'Solicitante' },
  { value: 'APPROVER',        label: 'Aprovador' },
  { value: 'APPROVER_SENIOR', label: 'Aprovador Sênior' },
  { value: 'ADMIN',           label: 'Administrador' },
];

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('REQUESTER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role });
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      window.location.replace('/dashboard');
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Erro ao criar conta. Tente novamente.';
      setError(message);
    } finally {
      setLoading(false);
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
            Gestão de
            <br />
            Compras
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

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Nome completo</label>
              <input
                id="reg-name"
                type="text"
                className="form-input login-input"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">E-mail corporativo</label>
              <input
                id="reg-email"
                type="email"
                className="form-input login-input"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Senha</label>
              <input
                id="reg-password"
                type="password"
                className="form-input login-input"
                placeholder="Crie uma senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-role">Perfil</label>
              <select
                id="reg-role"
                className="form-select login-select"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {error && <div className="form-error">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary btn-full login-submit"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
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
