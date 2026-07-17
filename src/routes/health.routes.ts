import { Router, type Router as ExpressRouter } from 'express';
import { StatusCodes } from 'http-status-codes';

const healthRoutes: ExpressRouter = Router();

healthRoutes.get('/health', (_req, res) => {
  const date = new Date();

  const dataFormatada = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const horaFormatada = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return res.status(StatusCodes.OK).json({
    status: 'OK',
    timestamp: `${dataFormatada} ${horaFormatada}`
  });
});

export default healthRoutes;
