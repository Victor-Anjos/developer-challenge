import api from './api';
import type { User } from '../types';

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post('/auth/login', payload);

    return data.data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<{ data: User }>('/auth/me');
    return data.data;
  },
};