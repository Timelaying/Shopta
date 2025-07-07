/**
 * Loads environment variables from a `.env` file into `process.env` using the `dotenv` package.
 * 
 * Defines the configuration object for JWT (JSON Web Token) authentication.
 * 
 * @property {string} accessTokenSecret - Secret key used to sign access tokens. Must be set in environment variables as `ACCESS_TOKEN_SECRET`.
 * @property {string} refreshTokenSecret - Secret key used to sign refresh tokens. Must be set in environment variables as `REFRESH_TOKEN_SECRET`.
 * @property {string} accessTokenExpiresIn - Expiration time for access tokens. Defaults to `'15m'` if not set in environment variables as `ACCESS_TOKEN_EXPIRES_IN`.
 * @property {string} refreshTokenExpiresIn - Expiration time for refresh tokens. Defaults to `'7d'` if not set in environment variables as `REFRESH_TOKEN_EXPIRES_IN`.
 * 
 * @remarks
 * The non-null assertion operator (`!`) is used for `accessTokenSecret` and `refreshTokenSecret`, 
 * which will throw an error at runtime if these environment variables are not defined.
 * 
 * @example
 * import jwtConfig from './config/jwtConfig';
 * console.log(jwtConfig.accessTokenSecret);
 */
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.ACCESS_TOKEN_SECRET) {
  throw new Error('ACCESS_TOKEN_SECRET is not defined in environment variables.');
}
if (!process.env.REFRESH_TOKEN_SECRET) {
  throw new Error('REFRESH_TOKEN_SECRET is not defined in environment variables.');
}

const jwtConfig = {
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
};

export default jwtConfig;