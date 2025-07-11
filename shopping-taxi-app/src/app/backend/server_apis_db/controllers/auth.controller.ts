// src/controllers/auth.controller.ts

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import * as UserModel from '../models/users.model';
import * as TokenModel from '../models/token.model';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  AccessTokenPayload,
} from '../utils/jwt';
import { AuthenticatedRequest } from '../middleware/jwtMiddleware';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await UserModel.createUser(username, email, hashed);
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const user = await UserModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = { id: user.id, username: user.username };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await TokenModel.saveToken(user.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ error: 'No refresh token' });
  }
  try {
    // explicitly type the decoded payload
    const decoded = verifyRefreshToken(token) as AccessTokenPayload;

    const valid = await TokenModel.isTokenValid(decoded.id, token);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const payload = { id: decoded.id, username: decoded.username };
    const accessToken = signAccessToken(payload);
    const newRefresh = signRefreshToken(payload);
    await TokenModel.replaceToken(decoded.id, token, newRefresh);

    res.cookie('refreshToken', newRefresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.json({ accessToken });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.refreshToken;
  try {
    if (token) {
      await TokenModel.deleteToken(token);
    }
    res.clearCookie('refreshToken');
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

// “me” now gets a fully-typed request
export const me = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  // `jwtMiddleware` guarantees `req.user` is AccessTokenPayload
  const userRecord = await UserModel.findUserById(req.user.id);
  res.json({
    user: {
      id:      userRecord.id,
      username:userRecord.username,
      email:   userRecord.email,
    },
  });
};
