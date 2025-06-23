import express from 'express';
import * as StoreController from '../controllers/stores.controller';

const router = express.Router();

router.post('/', StoreController.createStore);
router.get('/', StoreController.getAllStores);

export default router;
