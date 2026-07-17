import { authenticate } from '@shared/middlewares/authenticate.middleware';
import { Router } from 'express';
import authRoutes from './auth.routes';
import prizesRoutes from './prizes.routes';
import rafflePurchasesRoutes from './raffle-purchases.routes';
import rafflesRoutes from './raffles.routes';
import usersRoutes from './users.routes';

const router: Router = Router();

router.use('/auth', authRoutes);

router.use(authenticate);

router.use('/users', usersRoutes);
router.use('/raffles', rafflesRoutes);
router.use('/prizes', prizesRoutes);
router.use('/raffle-purchases', rafflePurchasesRoutes);

export default router;
