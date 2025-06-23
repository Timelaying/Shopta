import express from 'express';
import * as TripController from '../controllers/trips.controller';

const router = express.Router();

router.post('/', TripController.createTrip);
router.get('/user/:userId', TripController.getUserTrips);

export default router;
