import { Router } from 'express';

const router = Router();

// Example route
router.get('/', (_req, res) => {
  res.json({ message: 'Welcome to the API root!' });
});

export default router;
