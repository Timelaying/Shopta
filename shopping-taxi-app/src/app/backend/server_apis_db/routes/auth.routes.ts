import express from 'express';
import * as AuthController from '../controllers/auth.controller';

const router = express.Router();

// Public auth routes
router.post('/driver/register', AuthController.driverRegister);
router.post('/admin/register', AuthController.adminRegister);
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
router.get('/me', AuthController.me);

export default router;