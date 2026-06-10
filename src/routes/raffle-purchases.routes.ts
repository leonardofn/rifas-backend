import { RafflePurchasesController } from '@controllers/raffle-purchases.controller';
import { validate } from '@shared/middlewares/validate.middleware';
import {
  createRafflePurchaseBodySchema,
  findPurchasesPaginatedQuerySchema,
  purchaseIdParamsSchema,
  purchaseRaffleIdParamsSchema,
  purchaseUserIdParamsSchema,
  updateRafflePurchaseBodySchema
} from '@shared/schemas/raffle-purchase.schema';
import { Router, type Router as ExpressRouter } from 'express';

const rafflePurchasesRoutes: ExpressRouter = Router();
const rafflePurchasesController = new RafflePurchasesController();

rafflePurchasesRoutes.post(
  '/',
  validate(createRafflePurchaseBodySchema),
  rafflePurchasesController.create
);

rafflePurchasesRoutes.get(
  '/:id',
  validate(purchaseIdParamsSchema, 'params'),
  rafflePurchasesController.findById
);

rafflePurchasesRoutes.get(
  '/raffle/:raffleId',
  validate(purchaseRaffleIdParamsSchema, 'params'),
  validate(findPurchasesPaginatedQuerySchema, 'query'),
  rafflePurchasesController.findByRaffleId
);

rafflePurchasesRoutes.get(
  '/user/:userId',
  validate(purchaseUserIdParamsSchema, 'params'),
  validate(findPurchasesPaginatedQuerySchema, 'query'),
  rafflePurchasesController.findByUserId
);

rafflePurchasesRoutes.patch(
  '/:id/payment-status',
  validate(purchaseIdParamsSchema, 'params'),
  validate(updateRafflePurchaseBodySchema),
  rafflePurchasesController.updatePaymentStatus
);

rafflePurchasesRoutes.delete(
  '/:id',
  validate(purchaseIdParamsSchema, 'params'),
  rafflePurchasesController.delete
);

export default rafflePurchasesRoutes;
