import express, { type Express } from 'express';
import helmet from 'helmet';
import 'reflect-metadata';

// Inicializar o express
const app: Express = express();

// Habilitar headers de segurança HTTP
app.use(helmet());

// Habilitar o uso de JSON no corpo das requisições
app.use(express.json());

export default app;
