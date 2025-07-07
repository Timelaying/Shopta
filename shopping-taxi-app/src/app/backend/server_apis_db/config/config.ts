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
