import dotenv from 'dotenv';

dotenv.config();

function readNumberEnv(value: string | undefined, defaultValue: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

export const env = {
  port: readNumberEnv(process.env.PORT, 3000),
  dbHost: process.env.DB_HOST ?? 'localhost',
  dbPort: readNumberEnv(process.env.DB_PORT, 5432),
  dbUser: process.env.DB_USER ?? 'postgres',
  dbPassword: process.env.DB_PASSWORD ?? 'postgres',
  dbName: process.env.DB_NAME ?? 'rifas_db'
};
