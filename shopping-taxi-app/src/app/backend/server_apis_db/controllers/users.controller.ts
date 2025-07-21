// src/controllers/users.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as UserModel from '../models/users.model';

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const user = await UserModel.createUser(username, email, password);
    // 6. Let the user know registration succeeded
    res.status(201).json({ message: 'Registration successful', user });
  } catch (err: unknown) {
    // 3. Handle duplicate-key (unique violation) errors
    type PgError = { code?: string; constraint?: string };
    if (typeof err === 'object' && err !== null && 'code' in err && (err as PgError).code === '23505') {
      // Could inspect err.constraint to distinguish username vs email
      res.status(409).json({ error: 'Username or email already in use' });
    } else {
      next(err);
    }
  }
};


export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  try {
    const user = await UserModel.findUserById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};
