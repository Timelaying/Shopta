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

const COOKIE_OPTS = {
  httpOnly: true,
  secure: false,
  sameSite: 'lax' as const,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
};


// — REGISTER —
export const register: RequestHandler = async (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ error: 'Missing fields' });
    return;
  }
  try {
    const user = await UserModel.createUser(username, email, password);
    res.status(201).json({ message: 'Registration successful', user });
    return;
  } catch (err: unknown) {
    next(err);
    return;
  }
};

export const driverRegister: RequestHandler = async (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ error: 'Missing fields' });
    return;
  }
  try {
    const driver = await UserModel.createUser(username, email, password, 'driver');
    res.status(201).json({ message: 'Driver registration successful', user: driver });
    return;
  } catch (err: unknown) {
    next(err);
    return;
  }
};

export const adminRegister: RequestHandler = async (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ error: 'Missing fields' });
    return;
  }
  try {
    const admin = await UserModel.createUser(username, email, password, 'admin');
    res.status(201).json({ message: 'Admin registration successful', user: admin });
    return;
  } catch (err: unknown) {
    next(err);
    return;
  }
};

// — LOGIN —
export const login: RequestHandler = async (req, res, next) => {
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

    // Handle legacy plaintext passwords
    let valid = false;
    if (user.password.startsWith('$2')) {
      valid = await bcrypt.compare(password, user.password);
    } else {
      valid = password === user.password;
      if (valid) {
        const newHash = await bcrypt.hash(password, 10);
        await UserModel.updatePassword(user.id, newHash);
      }
    }

    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const payload = { id: user.id, username: user.username };
    const accessToken  = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await TokenModel.saveToken(user.id, refreshToken);

    res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
    res.json({ accessToken });
    return;
  } catch (err: unknown) {
    console.error('[login] error:', err);
    next(err);
    return;
  }
};

// — REFRESH —
export const refresh: RequestHandler = async (req, res) => {
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
    const newRefresh  = signRefreshToken(payload);

    await TokenModel.replaceToken(decoded.id, token, newRefresh);
    res.cookie('refreshToken', newRefresh, COOKIE_OPTS);
    res.json({ accessToken });
    return;
  } catch (err) {
    console.error('[refresh] error:', err);
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
};

// — LOGOUT —
export const logout: RequestHandler = async (req, res, next) => {
  const token = req.cookies.refreshToken;
  try {
    if (token) {
      await TokenModel.deleteToken(token);
    }
    res.clearCookie('refreshToken');
    res.sendStatus(204);
    return;
  } catch (err: unknown) {
    next(err);
    return;
  }
};

// — WHOAMI —
export const me: RequestHandler = async (req, res, next) => {
  const authReq = req as AuthenticatedRequest;
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
    return;
  } catch (err: unknown) {
    next(err);
    return;
  }
};
