import { env } from '@config/env';
import express, { type Express } from 'express';
import helmet from 'helmet';
import 'reflect-metadata';

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
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        }
      : false
  })
);

// Habilitar o uso de JSON no corpo das requisições
app.use(express.json());

export default app;
