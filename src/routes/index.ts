import { Router } from 'express';
import prizesRoutes from './prizes.routes';
import rafflesRoutes from './raffles.routes';

const router: Router = Router();

router.use('/raffles', rafflesRoutes);
router.use('/prizes', prizesRoutes);

export default router;
