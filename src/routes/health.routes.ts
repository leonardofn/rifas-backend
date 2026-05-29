import { Router, type Router as ExpressRouter } from 'express';

const healthRoutes: ExpressRouter = Router();

healthRoutes.get('/health', (_req, res) => {
  return res.status(200).json({
    status: 'OK',
    timestamp: new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  });
});

export default healthRoutes;
