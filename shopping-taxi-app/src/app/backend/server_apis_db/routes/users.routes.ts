import express from 'express';
import * as UserController from '../controllers/users.controller';

const router = express.Router();

router.post('/', UserController.createUser);
router.get('/:id', UserController.getUser);

export default router;
