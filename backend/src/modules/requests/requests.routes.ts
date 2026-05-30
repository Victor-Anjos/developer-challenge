import { Router } from 'express';
import { requestsController } from './requests.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', requestsController.list);
router.post('/', requireRole(Role.REQUESTER), requestsController.create);
router.get('/:id', requestsController.findById);
router.get('/:id/history', requestsController.history);

router.patch(
  '/:id/approve',
  requireRole(Role.APPROVER, Role.APPROVER_SENIOR, Role.ADMIN),
  requestsController.approve,
);

router.patch(
  '/:id/reject',
  requireRole(Role.APPROVER, Role.APPROVER_SENIOR, Role.ADMIN),
  requestsController.reject,
);

router.patch(
  '/:id/cancel',
  requireRole(Role.REQUESTER, Role.ADMIN),
  requestsController.cancel,
);

export { router as requestsRoutes };