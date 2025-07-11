// src/utils/jwt.ts
import * as jwt from 'jsonwebtoken';
import ms, { StringValue } from 'ms';
import jwtConfig from '../config/jwtConfig';

export const signAccessToken = (payload: object): string => {
  const expiresInSeconds = ms(
    jwtConfig.accessTokenExpiresIn as StringValue
  ) / 1000;

  const options: jwt.SignOptions = {
    expiresIn: expiresInSeconds,
  };

  return jwt.sign(
    payload,
    jwtConfig.accessTokenSecret as jwt.Secret,
    options
  );
};

export const signRefreshToken = (payload: object): string => {
  const expiresInSeconds = ms(
    jwtConfig.refreshTokenExpiresIn as StringValue
  ) / 1000;

  const options: jwt.SignOptions = {
    expiresIn: expiresInSeconds,
  };

  return jwt.sign(
    payload,
    jwtConfig.refreshTokenSecret as jwt.Secret,
    options
  );
};

export const verifyAccessToken = (token: string): string | object =>
  jwt.verify(
    token,
    jwtConfig.accessTokenSecret as jwt.Secret
  );

export const verifyRefreshToken = (token: string): string | object =>
  jwt.verify(
    token,
    jwtConfig.refreshTokenSecret as jwt.Secret
  );

