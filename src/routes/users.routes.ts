import { UsersController } from '@controllers/users.controller';
import { validate } from '@shared/middlewares/validate.middleware';
import {
  createUserBodySchema,
  findUsersPaginatedQuerySchema,
  updateUserBodySchema,
  userIdParamsSchema
} from '@shared/schemas/user.schema';
import { Router, type Router as ExpressRouter } from 'express';

const usersRoutes: ExpressRouter = Router();
const usersController = new UsersController();

usersRoutes.post('/', validate(createUserBodySchema), usersController.create);
usersRoutes.get(
  '/',
  validate(findUsersPaginatedQuerySchema, 'query'),
  usersController.findPaginated
);
usersRoutes.get('/:id', validate(userIdParamsSchema, 'params'), usersController.findById);
usersRoutes.put(
  '/:id',
  validate(userIdParamsSchema, 'params'),
  validate(updateUserBodySchema),
  usersController.update
);
usersRoutes.delete('/:id', validate(userIdParamsSchema, 'params'), usersController.delete);

export default usersRoutes;
