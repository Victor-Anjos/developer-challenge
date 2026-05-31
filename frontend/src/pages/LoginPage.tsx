import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const schema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  if (user) return <Navigate to="/dashboard" replace />;

  async function onSubmit(data: FormData) {
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      const message =
        err?.response?.data?.error ?? 'Erro ao fazer login. Tente novamente.';
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
          <h1 className="login-title">Bem-vindo de volta</h1>
          <p className="login-subtitle">Entre com sua conta corporativa Kingspan.</p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">E-mail corporativo</label>
              <input
                id="email"
                type="email"
                className={`form-input login-input ${errors.email ? 'input-error' : ''}`}
                placeholder="Digite seu e-mail"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <span className="field-error">{errors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                className={`form-input login-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && (
                <span className="field-error">{errors.password.message}</span>
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
              {isSubmitting ? 'Entrando...' : 'Entrar'}
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