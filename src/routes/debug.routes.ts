import { AppError } from '@shared/errors/app-error';
import { Router, type Router as ExpressRouter } from 'express';

const debugRoutes: ExpressRouter = Router();

debugRoutes.get('/test-error-async', async () => {
  throw new AppError('Erro async de teste.', 500, {
    source: 'test-error-async-route'
  });
});

debugRoutes.get('/test-error-validation', (_req, _res, next) => {
  next(
    new AppError('Erro de validação de teste.', 400, {
      field: 'email',
      reason: 'Formato inválido'
    })
  );
});

export default debugRoutes;
