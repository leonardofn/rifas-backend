import { Router } from 'express';
import rafflesRoutes from './raffles.routes';

const router: Router = Router();

router.use('/raffles', rafflesRoutes);

export default router;
