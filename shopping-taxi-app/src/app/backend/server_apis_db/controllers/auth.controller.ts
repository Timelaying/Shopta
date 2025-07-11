// src/controllers/auth.controller.ts
import { RequestHandler } from 'express';
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

export const register: RequestHandler = async (req, res, next): Promise<void> => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ error: 'Missing fields' });
    return;
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await UserModel.createUser(username, email, hashed);
    res.status(201).json({ user });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const login: RequestHandler = async (req, res, next): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Missing fields' });
    return;
  }
  try {
    const user = await UserModel.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
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
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const refresh: RequestHandler = async (req, res,): Promise<void> => {
  const token = req.cookies.refreshToken;
  if (!token) {
    res.status(401).json({ error: 'No refresh token' });
    return;
  }
  try {
    const decoded = verifyRefreshToken(token) as AccessTokenPayload;
    const valid = await TokenModel.isTokenValid(decoded.id, token);
    if (!valid) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
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
    return;
  } catch {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
};

export const logout: RequestHandler = async (req, res, next): Promise<void> => {
  const token = req.cookies.refreshToken;
  try {
    if (token) {
      await TokenModel.deleteToken(token);
    }
    res.clearCookie('refreshToken');
    res.sendStatus(204);
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const me: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  // Cast to our extended AuthenticatedRequest so TS knows about `user`
  const authReq = req as AuthenticatedRequest;
  try {
    const userRecord = await UserModel.findUserById(authReq.user.id);
    res.json({
      user: {
        id:       userRecord.id,
        username: userRecord.username,
        email:    userRecord.email,
      },
    });
    return;
  } catch (error) {
    next(error);
    return;
  }
};
