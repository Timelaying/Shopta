// src/routes/trips.routes.ts
import express from 'express';
import * as TripCtrl from '../controllers/trips.controller';
import { jwtMiddleware } from '../middleware/jwtMiddleware';
const router = express.Router();

// Customer routes
router.post('/', jwtMiddleware, TripCtrl.createTrip);
router.get('/', jwtMiddleware, TripCtrl.getMyTrips);

// Driver routes
router.get('/driver', jwtMiddleware, TripCtrl.getDriverTrips);
router.patch('/stops/:stopId/done', jwtMiddleware, TripCtrl.completeStop);

// Admin routes
router.get('/admin', jwtMiddleware, TripCtrl.adminGetTrips);

export default router;