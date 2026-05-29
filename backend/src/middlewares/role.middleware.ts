import { Role } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError';

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError('Acesso negado.', 403);
    }
    next();
  };
}