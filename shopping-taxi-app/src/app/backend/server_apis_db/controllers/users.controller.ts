// src/controllers/users.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as UserModel from '../models/users.model';

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const user = await UserModel.createUser(username, email, password);
    res
      .status(201)
      .json({ message: 'Registration successful', user });
  } catch (err: unknown) {
    console.error('❌ [createUser] error:', err);

    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code?: string }).code === '23505'
    ) {
      // Unique violation
      res
        .status(409)
        .json({ error: 'Username or email already in use', detail: (err as { detail?: string }).detail });
      return;
    }

    // Temporary: send back err.message so you can see if it's a DB syntax issue, bcrypt error, etc.
    res
      .status(500)
      .json({ error: 'Internal server error', detail: (err instanceof Error ? err.message : 'Unknown error') });
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
