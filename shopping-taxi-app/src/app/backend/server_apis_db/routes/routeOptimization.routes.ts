import { Router } from 'express';
import {
  getAISuggestedRoute,
  getOptimizedRoute,
} from '../controllers/routeOptimization.controller';

const router = Router();

router.post('/optimize', getOptimizedRoute);
router.post('/ai-suggestion', getAISuggestedRoute);

export default router;
