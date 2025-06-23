import express from 'express';
import * as StoreItemController from '../controllers/storeItems.controller';

const router = express.Router();

router.post('/', StoreItemController.linkItemToStore);
router.get('/:storeId', StoreItemController.getStoreItems);

export default router;

