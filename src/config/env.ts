import dotenv from 'dotenv';

dotenv.config();

type NodeEnv = 'development' | 'production' | 'test';

function readNumberEnv(value: string | undefined, defaultValue: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function readNodeEnv(value: string | undefined): NodeEnv {
  if (value === 'production' || value === 'test') {
    return value;
  }

  return 'development';
}

export const env = {
  nodeEnv: readNodeEnv(process.env.NODE_ENV),
  port: readNumberEnv(process.env.PORT, 3000),
  dbHost: process.env.DB_HOST ?? 'localhost',
  dbPort: readNumberEnv(process.env.DB_PORT, 5432),
  dbUser: process.env.DB_USER ?? 'postgres',
  dbPassword: process.env.DB_PASSWORD ?? 'postgres',
  dbName: process.env.DB_NAME ?? 'rifas_db'
};
