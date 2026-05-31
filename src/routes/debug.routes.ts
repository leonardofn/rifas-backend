import { AppError } from '@shared/errors/app-error';
import { Router, type Router as ExpressRouter } from 'express';
import { StatusCodes } from 'http-status-codes';

const debugRoutes: ExpressRouter = Router();

debugRoutes.get('/test-error-async', async () => {
  throw new AppError('Erro async de teste.', StatusCodes.INTERNAL_SERVER_ERROR, {
    source: 'test-error-async-route'
  });
});

debugRoutes.get('/test-error-validation', (_req, _res, next) => {
  next(
    new AppError('Erro de validação de teste.', StatusCodes.BAD_REQUEST, {
      field: 'email',
      reason: 'Formato inválido'
    })
  );
});

export default debugRoutes;
