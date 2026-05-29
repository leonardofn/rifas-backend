import { RafflesController } from '@controllers/raffles.controller';
import { validate } from '@shared/middlewares/validate.middleware';
import {
  changeStatusBodySchema,
  createRaffleBodySchema,
  findPaginatedQuerySchema,
  publicIdParamsSchema,
  raffleIdParamsSchema,
  updateRaffleBodySchema
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
  '/public/:publicId',
  validate(publicIdParamsSchema, 'params'),
  rafflesController.findByPublicId
);
rafflesRoutes.get('/:id', validate(raffleIdParamsSchema, 'params'), rafflesController.findById);
rafflesRoutes.patch(
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
