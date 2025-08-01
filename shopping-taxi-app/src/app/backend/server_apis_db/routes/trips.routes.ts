// src/routes/trips.routes.ts
import { Router, RequestHandler } from 'express';
import * as TripCtrl from '../controllers/trips.controller';
import { jwtMiddleware } from '../middleware/jwtMiddleware';

const router = Router();

// Customer routes
router.post(
    '/',
    jwtMiddleware,
    TripCtrl.createTrip as RequestHandler
);
router.get(
    '/',
    jwtMiddleware,
    TripCtrl.getMyTrips as RequestHandler
);

// Driver routes
router.get(
    '/driver',
    jwtMiddleware,
    TripCtrl.getDriverTrips as RequestHandler
);
router.patch(
    '/stops/:stopId/done',
    jwtMiddleware,
    TripCtrl.completeStop as RequestHandler
);

// Admin routes
router.get(
    '/admin',
    jwtMiddleware,
    TripCtrl.adminGetTrips as RequestHandler
);

export default router;
