import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { AppError } from '../../shared/errors/AppError';
import { generateToken } from '../../config/jwt';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

interface LoginInput {
  email: string;
  password: string;
}

export const authService = {
  async register({ name, email, password, role }: RegisterInput) {
    if (!name || !email || !password) {
      throw new AppError('Nome, email e senha são obrigatórios.', 400);
    }

    if (password.length < 6) {
      throw new AppError('A senha deve ter no mínimo 6 caracteres.', 400);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError('Email já cadastrado.', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role ?? Role.REQUESTER,
      },
    });

    const token = generateToken({
      sub: user.id,
      role: user.role,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  async login({ email, password }: LoginInput) {
    if (!email || !password) {
      throw new AppError('Email e senha são obrigatórios.', 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Credenciais inválidas.', 401);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AppError('Credenciais inválidas.', 401);
    }

    const token = generateToken({
      sub: user.id,
      role: user.role,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    return user;
  },
};