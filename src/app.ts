import express, { type Express } from 'express';
import 'reflect-metadata';

// Inicializar o express
const app: Express = express();

// Habilitar o uso de JSON no corpo das requisições
app.use(express.json());

export default app;
