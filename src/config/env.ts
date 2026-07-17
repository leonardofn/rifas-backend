import { AppConstants } from '@shared/constants';
import dotenv from 'dotenv';

dotenv.config();

type NodeEnv = 'development' | 'production' | 'test';

function readNodeEnv(value: string | undefined): NodeEnv {
  if (value === 'production' || value === 'test') {
    return value;
  }

  return 'development';
}

function readNumberEnv(value: string | undefined, defaultValue: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function readStringEnv(value: string | undefined, defaultValue: string): string {
  const normalized = value?.trim();
  return normalized && normalized.length > AppConstants.ZERO ? normalized : defaultValue;
}

export const env = {
  nodeEnv: readNodeEnv(process.env.NODE_ENV),
  port: readNumberEnv(process.env.PORT, AppConstants.DEFAULT_SERVER_PORT),
  dbHost: process.env.DB_HOST ?? 'localhost',
  dbPort: readNumberEnv(process.env.DB_PORT, AppConstants.DEFAULT_DB_PORT),
  dbUser: process.env.DB_USER ?? 'postgres',
  dbPassword: process.env.DB_PASSWORD ?? 'postgres',
  dbName: process.env.DB_NAME ?? 'rifas_db',
  jwtAccessSecret: readStringEnv(
    process.env.JWT_ACCESS_SECRET,
    'troque-este-segredo-em-producao-access-token'
  ),
  jwtRefreshSecret: readStringEnv(
    process.env.JWT_REFRESH_SECRET,
    'troque-este-segredo-em-producao-refresh-token'
  ),
  jwtAccessTokenTtlSeconds: readNumberEnv(
    process.env.JWT_ACCESS_TOKEN_TTL_SECONDS,
    AppConstants.JWT_ACCESS_TOKEN_TTL_SECONDS
  ),
  jwtRefreshTokenTtlSeconds: readNumberEnv(
    process.env.JWT_REFRESH_TOKEN_TTL_SECONDS,
    AppConstants.JWT_REFRESH_TOKEN_TTL_SECONDS
  )
};
