import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from './env';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.dbHost,
  port: env.dbPort,
  username: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  synchronize: false,
  logging: false,
  entities: ['src/entities/**/*.ts', 'dist/entities/**/*.js'],
  migrations: ['src/migrations/**/*.ts', 'dist/migrations/**/*.js']
});
