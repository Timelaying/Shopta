import express from 'express';
import * as ItemController from '../controllers/items.controller';

const router = express.Router();

router.post('/', ItemController.createItem);
router.get('/', ItemController.getAllItems);

export default router;
