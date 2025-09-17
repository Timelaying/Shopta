import { Router } from 'express';
import {
  listPromotions,
  listPromotionsForStore,
  createPromotion,
  updatePromotion,
  archivePromotion,
} from '../controllers/promotions.controller';

const router = Router();

router.get('/', listPromotions);
router.get('/store/:storeId', listPromotionsForStore);
router.post('/', createPromotion);
router.patch('/:id', updatePromotion);
router.delete('/:id', archivePromotion);

export default router;
