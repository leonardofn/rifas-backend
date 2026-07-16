import { Router } from 'express';
import prizesRoutes from './prizes.routes';
import rafflePurchasesRoutes from './raffle-purchases.routes';
import rafflesRoutes from './raffles.routes';
import usersRoutes from './users.routes';

const router: Router = Router();

router.use('/raffles', rafflesRoutes);
router.use('/prizes', prizesRoutes);
router.use('/raffle-purchases', rafflePurchasesRoutes);
router.use('/users', usersRoutes);

export default router;
