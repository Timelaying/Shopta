// src/utils/jwt.ts
import * as jwt from 'jsonwebtoken';
import ms, { StringValue } from 'ms';
import jwtConfig from '../config/jwtConfig';

export interface AccessTokenPayload extends jwt.JwtPayload {
  // add any custom claims here, for example a user's id and username
  id: string;
  username: string;
}

export const signAccessToken = (payload: object): string => {
  const expiresInSeconds = ms(
    jwtConfig.accessTokenExpiresIn as StringValue
  ) / 1000;

  return jwt.sign(
    payload,
    jwtConfig.accessTokenSecret as jwt.Secret,
    { expiresIn: expiresInSeconds }
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

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  // `jwt.verify` returns string | JwtPayload, so we assert it:
  return jwt.verify(
    token,
    jwtConfig.accessTokenSecret as jwt.Secret
  ) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): string | object =>
  jwt.verify(
    token,
    jwtConfig.refreshTokenSecret as jwt.Secret
  );

