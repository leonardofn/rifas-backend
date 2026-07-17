import { RafflesController } from '@controllers/raffles.controller';
import { validate } from '@shared/middlewares/validate.middleware';
import { findPaginatedBaseQuerySchema } from '@shared/schemas/base.schema';
import {
  changeStatusBodySchema,
  createRaffleBodySchema,
  findPaginatedQuerySchema,
  publicIdParamsSchema,
  raffleIdParamsSchema,
  updateRaffleBodySchema,
  userIdParamsSchema
} from '@shared/schemas/raffle.schema';
import { Router, type Router as ExpressRouter } from 'express';

const rafflesRoutes: ExpressRouter = Router();
const rafflesController = new RafflesController();

rafflesRoutes.post('/', validate(createRaffleBodySchema), rafflesController.create);
rafflesRoutes.get(
  '/',
  validate(findPaginatedQuerySchema, 'query'),
  rafflesController.findPaginated
);
rafflesRoutes.get(
  '/trending',
  validate(findPaginatedBaseQuerySchema, 'query'),
  rafflesController.findTrendingRafflesPaginated
);
rafflesRoutes.get(
  '/public/:publicId',
  validate(publicIdParamsSchema, 'params'),
  rafflesController.findByPublicId
);
rafflesRoutes.get(
  '/user/:userId',
  validate(userIdParamsSchema, 'params'),
  rafflesController.findByUserId
);
rafflesRoutes.get('/:id', validate(raffleIdParamsSchema, 'params'), rafflesController.findById);
rafflesRoutes.put(
  '/:id',
  validate(raffleIdParamsSchema, 'params'),
  validate(updateRaffleBodySchema),
  rafflesController.update
);
rafflesRoutes.patch(
  '/:id/status',
  validate(raffleIdParamsSchema, 'params'),
  validate(changeStatusBodySchema),
  rafflesController.changeStatus
);
rafflesRoutes.delete('/:id', validate(raffleIdParamsSchema, 'params'), rafflesController.delete);

export default rafflesRoutes;
