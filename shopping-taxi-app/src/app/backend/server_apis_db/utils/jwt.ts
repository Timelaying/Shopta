import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwtConfig';

export const signAccessToken = (payload: object) =>
  jwt.sign(
    payload,
    jwtConfig.accessTokenSecret as jwt.Secret,
    { expiresIn: jwtConfig.accessTokenExpiresIn }
  );

export const signRefreshToken = (payload: object) =>
  jwt.sign(
    payload,
    jwtConfig.refreshTokenSecret as jwt.Secret,
    { expiresIn: jwtConfig.refreshTokenExpiresIn }
  );

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, jwtConfig.accessTokenSecret as jwt.Secret);

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, jwtConfig.refreshTokenSecret as jwt.Secret);
