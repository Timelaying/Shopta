/**
 * Loads environment variables from a `.env` file into `process.env` using `dotenv`.
 * 
 * @function requireEnv
 * Throws an error if the specified environment variable is not set.
 * @param varName - The name of the required environment variable.
 * @returns The value of the environment variable.
 * @throws {Error} If the environment variable is not set.
 */

/**
 * Represents the configuration required to connect to a database.
 * 
 * @interface DBConfig
 * @property user - The database user.
 * @property host - The database host.
 * @property name - The database name.
 * @property password - The database password.
 * @property port - The database port.
 * @property [connectionString] - Optional connection string for the database.
 */

/**
 * Represents the application configuration.
 * 
 * @interface AppConfig
 * @property port - The port on which the application runs.
 * @property db - The database configuration.
 * @property baseUrl - The base URL of the application.
 */

/**
 * The main application configuration object.
 * 
 * @constant config
 * @type {AppConfig}
 * @default
 * - port: from environment variable `PORT` or 5001
 * - db: database configuration loaded from environment variables
 * - baseUrl: from environment variable `BASE_URL` or "http://localhost:5000"
 */
import dotenv from "dotenv";
dotenv.config();

function requireEnv(varName: string): string {
  const value = process.env[varName];
  if (!value) throw new Error(`Missing required environment variable: ${varName}`);
  return value;
} // this is used to ensure that the environment variables are set before the application starts, it is a utility function to throw an error if the variable is not set

interface DBConfig {
  user: string;
  host: string;
  name: string;
  password: string;
  port: number;
  connectionString?: string;

}

interface AppConfig {
  port: number;
  db: DBConfig;
  baseUrl: string;
}

const config: AppConfig = {
  port: process.env.PORT ? parseInt(process.env.PORT) : 5001,
  db: {
    user: requireEnv("DB_USER"),
    host: requireEnv("DB_HOST"),
    name: requireEnv("DB_NAME"),
    password: requireEnv("DB_PASSWORD"),
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  },
  baseUrl: process.env.BASE_URL ?? "http://localhost:5000",
};

export default config;
