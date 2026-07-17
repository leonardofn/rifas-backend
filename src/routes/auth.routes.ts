import { AuthController } from '@controllers/auth.controller';
import { authenticate } from '@shared/middlewares/authenticate.middleware';
import { validate } from '@shared/middlewares/validate.middleware';
import {
  loginBodySchema,
  refreshTokenBodySchema,
  registerBodySchema
} from '@shared/schemas/auth.schema';
import { Router, type Router as ExpressRouter } from 'express';

const authRoutes: ExpressRouter = Router();
const authController = new AuthController();

authRoutes.post('/register', validate(registerBodySchema), authController.register);
authRoutes.post('/login', validate(loginBodySchema), authController.login);
authRoutes.post('/refresh', validate(refreshTokenBodySchema), authController.refresh);
authRoutes.get('/me', authenticate, authController.me);
authRoutes.post('/logout', authenticate, authController.logout);

export default authRoutes;
