import express from 'express';
import * as TripItemController from '../controllers/tripItems.controller';

const router = express.Router();

router.post('/', TripItemController.addItemToTrip);
router.get('/:tripId', TripItemController.getTripItems);

export default router;
