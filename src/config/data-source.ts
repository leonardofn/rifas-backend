import { env } from '@config/env';
import { DataSource } from 'typeorm';

function resolvePaths(): { entities: string[]; migrations: string[] } {
  const isTsRuntime = __filename.endsWith('.ts');
  const entitiesPath = isTsRuntime ? ['src/entities/**/*.ts'] : ['dist/entities/**/*.js'];
  const migrationsPath = isTsRuntime ? ['src/migrations/**/*.ts'] : ['dist/migrations/**/*.js'];

  return {
    entities: entitiesPath,
    migrations: migrationsPath
  };
}

const { entities, migrations } = resolvePaths();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.dbHost,
  port: env.dbPort,
  username: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  synchronize: false,
  logging: false,
  entities,
  migrations
});
