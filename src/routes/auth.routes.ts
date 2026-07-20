import { AuthController } from '@controllers/auth.controller';
import { authenticate } from '@shared/middlewares/authenticate.middleware';
import { validate } from '@shared/middlewares/validate.middleware';
import {
  forgotPasswordBodySchema,
  loginBodySchema,
  refreshTokenBodySchema,
  registerBodySchema,
  resetPasswordBodySchema
} from '@shared/schemas/auth.schema';
import { Router, type Router as ExpressRouter } from 'express';

const authRoutes: ExpressRouter = Router();
const authController = new AuthController();

authRoutes.post('/register', validate(registerBodySchema), authController.register);
authRoutes.post('/login', validate(loginBodySchema), authController.login);
authRoutes.post('/refresh', validate(refreshTokenBodySchema), authController.refresh);
authRoutes.get('/me', authenticate, authController.me);
authRoutes.post('/logout', authenticate, authController.logout);
authRoutes.post(
  '/forgot-password',
  validate(forgotPasswordBodySchema),
  authController.forgotPassword
);
authRoutes.post('/reset-password', validate(resetPasswordBodySchema), authController.resetPassword);

export default authRoutes;
