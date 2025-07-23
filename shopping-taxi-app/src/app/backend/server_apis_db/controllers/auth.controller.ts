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

export const register: RequestHandler = async (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ error: 'Missing fields' });
    return;
  }
  try {
    // PASS RAW password — the model will hash it once
    const user = await UserModel.createUser(username, email, password);
    res.status(201).json({ message: 'Registration successful', user });
  } catch (err) {
    next(err);
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
    const accessToken  = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await TokenModel.saveToken(user.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',  // only true in prod
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.json({ accessToken });
  } catch (err) {
    console.error('[login] error:', err);
    return next(err);
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

export const me: RequestHandler = async (req, res, next): Promise<void> => {
  // tell TS this is the extended Request
  const authReq = req as AuthenticatedRequest;

  // runtime guard
  if (!authReq.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const userRecord = await UserModel.findUserById(authReq.user.id);
    res.json({
      user: {
        id:       userRecord.id,
        username: userRecord.username,
        email:    userRecord.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// -- DRIVER --
export const driverRegister: RequestHandler = async (req, res, next) => {
  const { username, email, password } = req.body as {
    username: string;
    email: string;
    password: string;
  };
  if (!username || !email || !password) {
    res.status(400).json({ error: 'Missing fields' });
    return;
  }
  try {
    const driver = await UserModel.createUser(username, email, password, 'driver');
    res.status(201).json({ message: 'Driver registration successful', user: driver });
    return;
  } catch (err) {
    next(err);
    return;
  }
};

export const adminRegister: RequestHandler = async (req, res, next) => {
  const { username, email, password } = req.body as {
    username: string;
    email: string;
    password: string;
  };
  if (!username || !email || !password) {
    res.status(400).json({ error: 'Missing fields' });
    return;
  }
  try {
    const admin = await UserModel.createUser(username, email, password, 'admin');
    res.status(201).json({ message: 'Admin registration successful', user: admin });
    return;
  } catch (err) {
    next(err);
    return;
  }
};