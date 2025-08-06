import { Router, RequestHandler } from 'express';
import * as RatingsCtrl from '../controllers/ratings.controller';

const router = Router();

router.post('/driver/:driverId', RatingsCtrl.rateDriver as RequestHandler);
router.post('/store/:storeId', RatingsCtrl.rateStore as RequestHandler);

export default router;
