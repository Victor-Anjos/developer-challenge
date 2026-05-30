import { Request, Response, NextFunction } from 'express';
import { requestsService } from './requests.service';

export const requestsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const request = await requestsService.create({
        ...req.body,
        requesterId: req.user!.id,
      });
      return res.status(201).json({ data: request });
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await requestsService.list({
        ...req.query as any,
        requesterId: req.user!.id,
        role: req.user!.role,
      });
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const request = await requestsService.findById(id);
      return res.status(200).json({ data: request });
    } catch (err) {
      next(err);
    }
  },

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const request = await requestsService.approve(
        id,
        req.user!.id,
        req.user!.role,
        req.body?.comment,
      );
      return res.status(200).json({ data: request });
    } catch (err) {
      next(err);
    }
  },

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const request = await requestsService.reject(
        id,
        req.user!.id,
        req.user!.role,
        req.body?.comment,
      );
      return res.status(200).json({ data: request });
    } catch (err) {
      next(err);
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const request = await requestsService.cancel(
        id,
        req.user!.id,
        req.user!.role,
        req.body?.comment,
      );
      return res.status(200).json({ data: request });
    } catch (err) {
      next(err);
    }
  },

  async history(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const history = await requestsService.history(id);
      return res.status(200).json({ data: history });
    } catch (err) {
      next(err);
    }
  },
};