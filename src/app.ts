import 'reflect-metadata';

import { env } from '@config/env';
import debugRoutes from '@routes/debug.routes';
import healthRoutes from '@routes/health.routes';
import routes from '@routes/index';
import { AppConstants } from '@shared/constants';
import { AppError } from '@shared/errors/app-error';
import { errorHandler } from '@shared/middlewares/error-handler.middleware';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { StatusCodes } from 'http-status-codes';

// Inicializar o express
const app: Express = express();

const isProduction = env.nodeEnv === 'production';

// Habilitar headers de segurança HTTP
app.use(
  helmet({
    // Em desenvolvimento, evita bloqueios de assets e ferramentas locais.
    contentSecurityPolicy: isProduction,
    crossOriginEmbedderPolicy: isProduction,
    hsts: isProduction
      ? {
          maxAge: AppConstants.SECONDS_IN_YEAR,
          includeSubDomains: true,
          preload: true
        }
      : false
  })
);

// Habilitar o uso de JSON no corpo das requisições
app.use(express.json());

// Endpoint para healthcheck da aplicação
app.use(healthRoutes);

// Habilitar o uso das rotas
app.use(routes);

if (env.nodeEnv !== 'production') {
  // Rotas de debug e desenvolvimento só são registradas em ambientes não-produtivos
  app.use(debugRoutes);
}

// Captura de rota inexistente para padronizar resposta de erro
app.use((_req, _res, next) => {
  next(new AppError('Rota não encontrada.', StatusCodes.NOT_FOUND));
});

// Middleware global de erro
app.use(errorHandler);

export default app;
