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
// Admin routes
router.get(
    '/admin',
    jwtMiddleware,
    TripCtrl.adminGetTrips as RequestHandler
);
router.patch(
    '/stops/:stopId/done',
    jwtMiddleware,
    TripCtrl.completeStop as RequestHandler
);
router.get(
    '/stops/:stopId',
    jwtMiddleware,
    TripCtrl.getTripStop as RequestHandler
);
router.get(
    '/:id',
    jwtMiddleware,
    TripCtrl.getTripById as RequestHandler
);

export default router;
