import { Router } from 'express';
import {
  getTripSummary,
  ingestTripAnalytics,
} from '../controllers/analytics.controller';

const router = Router();

router.get('/summary', getTripSummary);
router.post('/ingest', ingestTripAnalytics);

export default router;
