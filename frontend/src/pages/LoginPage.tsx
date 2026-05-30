import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        'Erro ao fazer login. Tente novamente.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* Lado esquerdo - Mantido igual */}
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

        <div className="login-footer">
          © 2026 Kingspan - Uso interno
        </div>
      </div>

      {/* Lado direito - CORRIGIDO */}
      <div className="login-right">
        <div className="login-form-wrapper">
          <h1 className="login-title">
            Bem-vindo de volta
          </h1>

          <p className="login-subtitle">
            Entre com sua conta corporativa Kingspan.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                E-mail corporativo
              </label>
              <input
                id="email"
                type="email"
                className="form-input login-input"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                className="form-input login-input"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {/* Checkbox "Manter conectado" - ADICIONADO */}
            <div className="login-checkbox-wrapper">
              <label className="login-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="login-checkbox"
                />
                <span>Manter conectado</span>
              </label>
            </div>

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full login-submit"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="login-switch">
            Não tem conta?{' '}
            <Link to="/register" className="login-switch-link">Cadastre-se</Link>
          </div>
        </div>
      </div>
    </div>
  );
}