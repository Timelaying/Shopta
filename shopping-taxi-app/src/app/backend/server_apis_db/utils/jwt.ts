// src/utils/jwt.ts
import * as jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwtConfig';

export const signAccessToken = (payload: object): string => {
  const options: jwt.SignOptions = {
    expiresIn: jwtConfig.accessTokenExpiresIn,
  };
  return jwt.sign(
    payload,
    jwtConfig.accessTokenSecret as jwt.Secret,
    options
  );
};

export const signRefreshToken = (payload: object): string => {
  const options: jwt.SignOptions = {
    expiresIn: jwtConfig.refreshTokenExpiresIn,
  };
  return jwt.sign(
    payload,
    jwtConfig.refreshTokenSecret as jwt.Secret,
    options
  );
};

export const verifyAccessToken = (token: string): string | object => {
  return jwt.verify(
    token,
    jwtConfig.accessTokenSecret as jwt.Secret
  );
};

export const verifyRefreshToken = (token: string): string | object => {
  return jwt.verify(
    token,
    jwtConfig.refreshTokenSecret as jwt.Secret
  );
};
