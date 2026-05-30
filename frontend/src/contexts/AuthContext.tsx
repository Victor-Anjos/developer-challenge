import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '../types';
import { authService } from '../services/auth';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  try {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (
      storedToken &&
      storedToken !== 'undefined' &&
      storedUser &&
      storedUser !== 'undefined'
    ) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } finally {
    setIsLoading(false);
  }
}, []);

  async function login(email: string, password: string) {
  const result = await authService.login({ email, password });

  localStorage.setItem('token', result.token);
  localStorage.setItem('user', JSON.stringify(result.user));

  setToken(result.token);
  setUser(result.user);
}

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
