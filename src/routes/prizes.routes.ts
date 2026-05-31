import { PrizesController } from '@controllers/prizes.controller';
import { validate } from '@shared/middlewares/validate.middleware';
import {
  createPrizeBodySchema,
  prizeIdParamsSchema,
  raffleIdParamsSchema,
  updatePrizeBodySchema
} from '@shared/schemas/prize.schema';
import { Router, type Router as ExpressRouter } from 'express';

const prizesRoutes: ExpressRouter = Router();
const prizesController = new PrizesController();

prizesRoutes.post('/', validate(createPrizeBodySchema), prizesController.create);
prizesRoutes.get(
  '/raffle/:raffleId',
  validate(raffleIdParamsSchema, 'params'),
  prizesController.findByRaffleId
);
prizesRoutes.get('/:id', validate(prizeIdParamsSchema, 'params'), prizesController.findById);
prizesRoutes.put(
  '/:id',
  validate(prizeIdParamsSchema, 'params'),
  validate(updatePrizeBodySchema),
  prizesController.update
);
prizesRoutes.delete('/:id', validate(prizeIdParamsSchema, 'params'), prizesController.delete);

export default prizesRoutes;
