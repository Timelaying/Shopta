import dotenv from "dotenv";
dotenv.config();

interface DBConfig {
  user: string | undefined;
  host: string | undefined;
  name: string | undefined;
  password: string | undefined;
  port: string | undefined;
}

interface AppConfig {
  port: string | number;
  db: DBConfig;
  baseUrl: string;
}

const config: AppConfig = {
  port: process.env.PORT || 5000,
  db: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    name: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  },
  baseUrl: process.env.BASE_URL || "http://localhost:5000",
};

export default config;