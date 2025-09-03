import express from 'express';
import * as StoreCtrl from '../controllers/stores.controller';
import { jwtMiddleware } from '../middleware/jwtMiddleware';

const router = express.Router();
router.get('/', jwtMiddleware, StoreCtrl.listStores);
router.get('/:id', jwtMiddleware, StoreCtrl.getStore);
export default router;
