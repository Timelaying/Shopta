import { Router } from 'express';
import {
  getReferralProfile,
  regenerateReferralCode,
  getReferralLeaderboard,
} from '../controllers/referrals.controller';

const router = Router();

router.get('/profile', getReferralProfile);
router.post('/regenerate', regenerateReferralCode);
router.get('/leaderboard', getReferralLeaderboard);

export default router;
