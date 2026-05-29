import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import { AppError } from '../shared/errors/AppError';

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new AppError('Token não fornecido.', 401);
    }

    const token = header.split(' ')[1];
    const payload = verifyToken(token);

    req.user = {
      id: payload.sub,
      role: payload.role as any,
      email: payload.email,
    };

    next();
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('Token inválido ou expirado.', 401);
  }
}